import type { BurstStage, CharacterDetail, CharacterSummary, ImportedSnapshot, NikkeRecord } from "../types";

const API_BASE = "https://nikke-api.pages.dev";

type JsonObject = Record<string, unknown>;

function obj(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  const localized = obj(value);
  return String(localized.ja ?? localized.en ?? localized.ko ?? "");
}

function parseBursts(value: unknown): BurstStage[] {
  const source = Array.isArray(value) ? value : [value];
  const joined = source.map(String).join(" ").toUpperCase();
  // APIの `All` はレッドフード等の段階可変バーストを表す。
  if (/\bALL\b/.test(joined)) return ["I", "II", "III"];
  const result: BurstStage[] = [];
  if (/(^|[^I])I([^I]|$)|BURST\s*1|Ⅰ/.test(joined)) result.push("I");
  if (/II([^I]|$)|BURST\s*2|Ⅱ/.test(joined)) result.push("II");
  if (/III|BURST\s*3|Ⅲ/.test(joined)) result.push("III");
  return result;
}

export function normalizeCharacter(raw: unknown): CharacterSummary {
  const item = obj(raw);
  const weapon = obj(item.weapon);
  const images = obj(item.images);
  return {
    id: String(item.id ?? item.resourceId ?? text(item.name)),
    resourceId: typeof item.resourceId === "number" ? item.resourceId : undefined,
    name: text(item.name) || "名称不明",
    rarity: text(item.rarity),
    class: text(item.class),
    bursts: parseBursts(item.burst ?? item.burstStep),
    corporation: text(item.corporation),
    element: text(item.element),
    weapon: text(weapon.type ?? item.weapon),
    icon: text(images.icon ?? item.icon) || undefined,
    source: "nikke-api",
  };
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) {
    const reason = response.status === 404 ? "見つからないか、共有設定が非公開です。" : `HTTP ${response.status}`;
    throw new Error(reason);
  }
  return response.json();
}

export async function fetchCatalog(signal?: AbortSignal): Promise<CharacterSummary[]> {
  const fields = "id,resourceId,name,rarity,class,burst,corporation,element,weapon,images.icon";
  const json = obj(await getJson(`${API_BASE}/api/nikkes?lang=ja&limit=500&fields=${encodeURIComponent(fields)}`, signal));
  const characters = Array.isArray(json.characters) ? json.characters : [];
  if (characters.length === 0) throw new Error("キャラ一覧が空でした。");
  return characters.map(normalizeCharacter).sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

export async function fetchCharacterDetail(id: string, signal?: AbortSignal): Promise<CharacterDetail> {
  const raw = obj(await getJson(`${API_BASE}/api/nikkes/${encodeURIComponent(id)}?lang=ja`, signal));
  const base = normalizeCharacter(raw);
  const details = obj(raw.details);
  const skills = Array.isArray(details.skills) ? details.skills.map((entry) => {
    const skill = obj(entry);
    const cooltime = Array.isArray(skill.cooltime) ? Number(skill.cooltime.at(-1)) : undefined;
    return { slot: text(skill.slot), name: text(skill.name), description: text(skill.descriptions), cooldown: Number.isFinite(cooltime) ? cooltime : undefined };
  }) : [];
  return { ...base, skills, fetchedAt: new Date().toISOString() };
}

export function extractBlablaId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("共有リンクを入力してください。");
  try {
    const url = new URL(trimmed);
    const id = url.searchParams.get("openid") ?? url.searchParams.get("blablaid");
    if (!id) throw new Error("リンクにopenidがありません。");
    return id;
  } catch (error) {
    if (/^[A-Za-z0-9_-]{6,}$/.test(trimmed)) return trimmed;
    throw error instanceof Error ? error : new Error("共有リンクを確認してください。");
  }
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return undefined;
}

export async function importBlablaRoster(link: string): Promise<Array<{ id: string; name: string; resourceId?: number; snapshot: ImportedSnapshot }>> {
  const blablaId = extractBlablaId(link);
  // 共有URLやopenidは保存しない。APIへ一度送信し、結果だけを個人データへマージする。
  const rawJson = await getJson(`${API_BASE}/api/user/${encodeURIComponent(blablaId)}/nikke?lang=ja`);
  const json = obj(rawJson);
  const candidates = (Array.isArray(rawJson) ? rawJson : [json.nikkes, json.characters, json.data, json.items].find(Array.isArray)) as unknown[] | undefined;
  if (!candidates?.length) throw new Error("公開された所持ニケを取得できませんでした。共有設定を確認してください。");
  const fetchedAt = new Date().toISOString();
  return candidates.map((raw) => {
    const item = obj(raw);
    const character = obj(item.character);
    const combat = obj(item.combat);
    const id = String(character.id ?? item.characterId ?? item.id ?? character.resourceId ?? character.nameCode ?? "");
    const grade = firstNumber(item.grade, combat.grade);
    const core = firstNumber(item.core, combat.core);
    const snapshot: ImportedSnapshot = {
      level: firstNumber(combat.level, item.level, item.lv),
      limitBreak: grade !== undefined || core !== undefined ? Math.min(3, grade ?? 0) + Math.max(0, core ?? 0) : firstNumber(combat.limitBreak, item.limitBreak, item.coreBreak),
      combatPower: firstNumber(typeof item.combat === "number" ? item.combat : undefined, combat.power, item.combatPower, item.power),
      fetchedAt,
      source: "BlablaLink共有プロフィール / 非公式NIKKE API",
    };
    return {
      id,
      name: text(character.name ?? item.name),
      resourceId: firstNumber(character.resourceId),
      snapshot,
    };
  }).filter((entry) => entry.id);
}

export function mergeImportedRecord(current: NikkeRecord | undefined, snapshot: ImportedSnapshot): NikkeRecord {
  // 手入力フィールドは一切上書きしない。UIでは手入力値を優先し、未入力時のみsnapshotを参照する。
  return { ...(current ?? { owned: true, favorite: false }), owned: true, imported: snapshot };
}
