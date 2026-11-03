import type { BurstStage, CharacterDetail, CharacterSummary, CollectionRecord, GearRecord, GearSlot, ImportedSnapshot, NikkeRecord, OverloadOption } from "../types";

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
  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new Error("通信できませんでした。インターネット接続を確認して、もう一度お試しください。");
  }
  if (!response.ok) {
    const reason = response.status === 400 ? "共有URLの形式またはサーバー情報が正しくありません。共有URL全体をコピーし直してください。" : response.status === 404 ? "共有プロフィールが非公開、または見つかりません。BlablaLinkの公開設定を確認してください。" : response.status === 429 ? "短時間に更新が集中しています。しばらく待ってから再試行してください。" : response.status === 502 ? "BlablaLink側との接続に失敗しました（HTTP 502）。保存済みデータは変更していません。時間を置いて再試行してください。" : response.status === 503 ? "BlablaLink取込APIは現在利用できません（HTTP 503）。時間を置いて再試行してください。" : `APIでエラーが発生しました（HTTP ${response.status}）。保存済みデータは変更していません。`;
    throw new Error(reason);
  }
  try { return await response.json(); }
  catch { throw new Error("APIの応答を読み取れませんでした。時間を置いて再試行してください。"); }
}

export function blablaErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/[ぁ-んァ-ヶ一-龠]/.test(message)) return message;
  if (/invalid url|construct.*url|parsed as a url/i.test(message)) return "BlablaLink共有URLを読み取れませんでした。共有URL全体をコピーし直してください。";
  if (/failed to fetch|network|load failed|internet/i.test(message)) return "通信できませんでした。インターネット接続を確認して、もう一度お試しください。";
  if (/json|unexpected token/i.test(message)) return "APIの応答を読み取れませんでした。時間を置いて再試行してください。";
  return "BlablaLinkからの取り込みに失敗しました。保存済みデータは変更していません。時間を置いて再試行してください。";
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
  const cleaned = input.trim().replace(/[\u200B-\u200D\uFEFF]/g, "");
  if (!cleaned) throw new Error("共有リンクを入力してください。");
  // BlablaLinkのopenidは標準Base64なので、末尾の = と + / も有効文字として扱う。
  const isOpenid = (value: string) => /^[A-Za-z0-9+/_-]{6,}={0,2}$/.test(value);
  if (isOpenid(cleaned)) return cleaned;

  const pastedUrl = cleaned.match(/https?:\/\/[^\s<>"']+/i)?.[0]?.replace(/[\])}>、。]+$/g, "") ?? cleaned;
  try {
    const url = new URL(pastedUrl);
    const id = url.searchParams.get("openid") ?? url.searchParams.get("blablaid");
    if (!id) throw new Error("リンクにopenidがありません。");
    if (!isOpenid(id)) throw new Error("openidの形式を確認してください。");
    return id;
  } catch (error) {
    if (error instanceof Error && /openid/.test(error.message)) throw error;
    const queryId = cleaned.match(/(?:openid|blablaid)=([^&#\s)\]]+)/i)?.[1];
    if (queryId) {
      try {
        const decoded = decodeURIComponent(queryId);
        if (isOpenid(decoded)) return decoded;
      } catch { /* 下の共通メッセージを表示する */ }
    }
    throw new Error("BlablaLink共有URLを確認してください。URL全体をコピーして貼り付けてください。");
  }
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return undefined;
}

type MasterItem = { id: number; name: string; rare?: string; slot?: string; corporation?: string; rank?: number };
export interface ImportedRosterRow { nameCode: number; resourceId?: number; snapshot: ImportedSnapshot }
export interface ImportedRoster { rows: ImportedRosterRow[]; area?: number; fetchedAt: string }

function numericEntries(source: JsonObject, pattern: RegExp): number[] {
  return Object.entries(source).filter(([key]) => pattern.test(key)).map(([, value]) => firstNumber(value)).filter((value): value is number => value !== undefined && value > 0);
}

function normalizeSlot(slot: string): GearSlot { return ({ body: "chest", torso: "chest", arm: "arms", leg: "legs" } as Record<string, GearSlot>)[slot] ?? "head"; }

function parseGear(detail: JsonObject, equips: Map<number, MasterItem>, options: Map<number, MasterItem>, effects: Map<number, JsonObject>): Partial<Record<GearSlot, GearRecord>> {
  const result: Partial<Record<GearSlot, GearRecord>> = {};
  for (const rawSlot of ["head", "torso", "arm", "leg"]) {
    const tid = firstNumber(detail[`${rawSlot}_equip_tid`]);
    if (!tid) continue;
    const master = equips.get(tid);
    const optionIds = numericEntries(detail, new RegExp(`^${rawSlot}_equip_.*(option|effect).*`, "i"));
    const parsedOptions: OverloadOption[] = [...new Set(optionIds)].map((id) => {
      const option = options.get(id);
      const state = effects.get(id);
      const functions = Array.isArray(state?.function_details) ? state.function_details.map(obj) : [];
      const value = firstNumber(functions[0]?.function_value);
      return { id, name: option?.name ?? `効果ID ${id}`, rank: option?.rank, value: value === undefined ? undefined : Math.abs(value) / 100, unit: value === undefined ? undefined : "%" };
    });
    result[normalizeSlot(rawSlot)] = {
      id: tid,
      name: master?.name ?? `装備ID ${tid}`,
      corporation: master?.corporation,
      tier: parsedOptions.length ? "OL" : (master?.rare ?? "未設定"),
      level: firstNumber(detail[`${rawSlot}_equip_lv`], detail[`${rawSlot}_equip_level`]) ?? 0,
      overload: parsedOptions.length > 0 || master?.rare === "T10",
      options: parsedOptions,
    };
  }
  return result;
}

function parseCollection(detail: JsonObject, favorites: Map<number, MasterItem>): CollectionRecord | undefined {
  const id = firstNumber(detail.favorite_item_tid, detail.favorite_tid, detail.collection_item_tid, detail.collection_tid);
  if (!id) return undefined;
  const master = favorites.get(id);
  const rawRare = master?.rare;
  const rarity = rawRare === "R" || rawRare === "SR" || rawRare === "SSR" ? rawRare : "なし";
  return { id, name: master?.name ?? `コレクションID ${id}`, rarity, level: firstNumber(detail.favorite_item_lv, detail.favorite_lv, detail.collection_item_lv, detail.collection_lv) ?? 0, treasure: rarity === "SSR" || Boolean(detail.favorite_item_is_treasure ?? detail.is_favorite_item) };
}

function listMap(json: unknown, key: string): Map<number, MasterItem> {
  const rows = obj(json)[key];
  return new Map((Array.isArray(rows) ? rows : []).map((raw) => {
    const item = obj(raw);
    return [Number(item.id), { id: Number(item.id), name: text(item.name) || `${item.id}`, rare: text(item.rare), slot: text(item.slot), corporation: text(item.corporation), rank: firstNumber(item.rank) }];
  }));
}

export async function importBlablaRoster(input: string, area?: number): Promise<ImportedRoster> {
  const blablaId = extractBlablaId(input);
  const areaQuery = area ? `?area=${area}` : "";
  const [rosterRaw, equipsRaw, optionsRaw, cubesRaw, favoritesRaw, idMapRaw] = await Promise.all([
    getJson(`${API_BASE}/api/user/${encodeURIComponent(blablaId)}/roster${areaQuery}`),
    getJson(`${API_BASE}/api/equips?lang=ja&limit=500`), getJson(`${API_BASE}/api/equips/options?lang=ja&limit=500`),
    getJson(`${API_BASE}/api/cubes?lang=ja&limit=500`), getJson(`${API_BASE}/api/favorites?lang=ja&limit=500`),
    getJson(`${API_BASE}/api/tables/character_id_map.json`),
  ]);
  return parseRosterPayload(rosterRaw, equipsRaw, optionsRaw, cubesRaw, favoritesRaw, idMapRaw);
}

export function parseRosterPayload(rosterRaw: unknown, equipsRaw: unknown, optionsRaw: unknown, cubesRaw: unknown, favoritesRaw: unknown, idMapRaw: unknown, now = new Date()): ImportedRoster {
  const areas = Array.isArray(obj(rosterRaw).areas) ? obj(rosterRaw).areas as unknown[] : [];
  const selected = areas.map(obj).find((item) => Array.isArray(item.characters) && item.characters.length > 0);
  if (!selected) throw new Error("公開された所持ニケを取得できませんでした。共有設定を確認してください。");
  const characters = (selected.characters as unknown[]).map(obj);
  const details = (Array.isArray(selected.details) ? selected.details : []).map(obj);
  if (details.length < characters.length * 0.8) throw new Error("詳細データが不足していたため取り込みませんでした。保存済みデータは変更していません。");
  const detailByCode = new Map(details.map((item) => [firstNumber(item.name_code), item]));
  const effects = new Map((Array.isArray(selected.stateEffects) ? selected.stateEffects : []).map((raw) => { const item = obj(raw); return [Number(item.id), item]; }));
  const equips = listMap(equipsRaw, "equips"), options = listMap(optionsRaw, "options"), cubes = listMap(cubesRaw, "cubes"), favorites = listMap(favoritesRaw, "favorites");
  const idRows = Array.isArray(idMapRaw) ? idMapRaw.map(obj) : [];
  const resourceByCode = new Map<number, number>();
  for (const row of idRows) { const code = firstNumber(row.name_code), resource = firstNumber(row.resource_id); if (code && resource && !resourceByCode.has(code)) resourceByCode.set(code, resource); }
  const fetchedAt = now.toISOString();
  const rows = characters.map((item): ImportedRosterRow | null => {
    const nameCode = firstNumber(item.name_code); if (!nameCode) return null;
    const detail = detailByCode.get(nameCode) ?? {};
    const cubeId = firstNumber(detail.cube_tid, detail.cube_id, detail.harmony_cube_tid);
    const cubeMaster = cubeId ? cubes.get(cubeId) : undefined;
    const grade = firstNumber(item.grade), core = firstNumber(item.core);
    return { nameCode, resourceId: resourceByCode.get(nameCode), snapshot: {
      level: firstNumber(item.lv, item.level), limitBreak: grade !== undefined || core !== undefined ? Math.min(3, grade ?? 0) + Math.max(0, core ?? 0) : undefined,
      combatPower: firstNumber(item.combat, item.combat_power),
      skills: [firstNumber(detail.skill1_lv) ?? 1, firstNumber(detail.skill2_lv) ?? 1, firstNumber(detail.ulti_skill_lv, detail.burst_lv) ?? 1],
      gear: parseGear(detail, equips, options, effects),
      cube: cubeId ? { id: cubeId, name: cubeMaster?.name ?? `キューブID ${cubeId}`, level: firstNumber(detail.cube_lv, detail.cube_level, detail.harmony_cube_lv) ?? 0 } : undefined,
      collection: parseCollection(detail, favorites), fetchedAt, source: "BlablaLink公開プロフィール / 非公式NIKKE API roster",
    } };
  }).filter((row): row is ImportedRosterRow => row !== null);
  if (!rows.length) throw new Error("所持ニケが0件だったため取り込みませんでした。");
  return { rows, area: firstNumber(selected.area), fetchedAt };
}

export function mergeImportedRecord(current: NikkeRecord | undefined, snapshot: ImportedSnapshot): NikkeRecord {
  // 旧版の手入力フィールドはバックアップ互換のため保持するが、画面表示では最新の取込値を正とする。
  return { ...(current ?? { owned: true, favorite: false }), owned: true, imported: snapshot };
}
