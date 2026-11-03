import type { BurstStage, CharacterSummary, NikkeRecord, TeamSuggestion } from "../types";

export type Purpose = "campaign" | "kraken" | "mirror" | "indivilla" | "ultra" | "harvester";

export const purposes: Array<{ id: Purpose; label: string }> = [
  { id: "campaign", label: "キャンペーン（フルオート）" },
  { id: "kraken", label: "異常個体：クラーケン" },
  { id: "mirror", label: "異常個体：ミラーコンテナ" },
  { id: "indivilla", label: "異常個体：インディビリア" },
  { id: "ultra", label: "異常個体：ウルトラ" },
  { id: "harvester", label: "異常個体：ハーベスター" },
];

const bosses: Record<Exclude<Purpose, "campaign">, { weak: string; dangerous: string; note: string }> = {
  kraken: { weak: "Wind", dangerous: "Electronic", note: "風圧が有利。電撃は被ダメージ面で不利。" },
  mirror: { weak: "Electronic", dangerous: "Fire", note: "電撃が有利。灼熱は被ダメージ面で不利。" },
  indivilla: { weak: "Fire", dangerous: "Iron", note: "灼熱が有利。鉄甲は被ダメージ面で不利。" },
  ultra: { weak: "Iron", dangerous: "Water", note: "鉄甲が有利。水冷は被ダメージ面で不利。" },
  harvester: { weak: "Water", dangerous: "Wind", note: "水冷が有利。風圧は被ダメージ面で不利。" },
};

const exact = (names: string[]) => new Set(names);
const supportNames = exact(["リター", "クラウン", "ナガ", "ドロシー", "ブラン", "ノワール", "ティア", "ラプンツェル"]);
const healerNames = exact(["ラプンツェル", "ナガ", "マルチャーナ", "ヘルム", "ブラン"]);
const cooldownNames = exact(["リター", "ドロシー", "D：キラーワイフ", "ボリューム", "ルージュ"]);
const gaugeNames = exact(["センチ", "アニス", "ジャッカル", "レッドフード"]);
const rolePriority: Record<string, number> = {
  "リター": 30, "クラウン": 30, "ナガ": 22, "ドロシー": 24, "D：キラーワイフ": 24,
  "ブラン": 17, "ノワール": 17, "ティア": 17, "ラプンツェル": 15, "ルージュ": 20,
  "レッドフード": 24, "ラピ：レッドフード": 24, "マリアン：クイーン": 23,
};
const burstCooldown: Record<string, number> = {
  "リター": 20, "ドロシー": 20, "ボリューム": 20, "D：キラーワイフ": 20, "ルージュ": 20,
  "クラウン": 20, "ナガ": 20, "センチ": 20, "ブラン": 40, "ノア": 40, "ラプンツェル": 60,
  "レッドフード": 40,
};

function ruleScore(character: CharacterSummary, boss: { weak: string; dangerous: string } | null): number {
  let score = rolePriority[character.name] ?? 0;
  if (supportNames.has(character.name)) score += 8;
  if (cooldownNames.has(character.name)) score += 10;
  if (character.bursts.length === 1) score += 4;
  if (boss && character.element === boss.weak) score += 22;
  if (boss && character.element === boss.dangerous) score -= 12;
  if (gaugeNames.has(character.name) || character.weapon === "RL") score += 3;
  return score;
}

function sortedPool(characters: CharacterSummary[], boss: { weak: string; dangerous: string } | null) {
  return characters.map((character, index) => ({ character, index, score: ruleScore(character, boss) }))
    .sort((a, b) => b.score - a.score || a.index - b.index || a.character.name.localeCompare(b.character.name, "ja"));
}

function assemble(characters: CharacterSummary[], boss: { weak: string; dangerous: string } | null): CharacterSummary[] {
  const scored = sortedPool(characters, boss);
  const chosen: CharacterSummary[] = [];
  const take = (stage: BurstStage, desiredCount: number) => {
    const candidates = [...scored].sort((a, b) => {
      const dedicated = Number(b.character.bursts.length === 1) - Number(a.character.bursts.length === 1);
      return dedicated || b.score - a.score || a.index - b.index;
    });
    for (const entry of candidates) {
      if (chosen.length >= 5 || chosen.includes(entry.character) || !entry.character.bursts.includes(stage)) continue;
      chosen.push(entry.character);
      if (chosen.filter((item) => item.bursts.includes(stage)).length >= desiredCount) break;
    }
  };

  // フルオートの左からの発動優先を想定し、I→II→主力III→次のIIIの順に置く。
  take("I", 1);
  take("II", 1);
  take("III", 1);
  take("III", 2);
  for (const entry of scored) {
    if (chosen.length >= 5) break;
    if (!chosen.includes(entry.character)) chosen.push(entry.character);
  }
  return chosen;
}

function isOriginalRedHood(character: CharacterSummary) {
  return character.name === "レッドフード" && character.bursts.length > 1;
}

function roleDescription(character: CharacterSummary, boss: { weak: string; dangerous: string } | null) {
  const labels: string[] = [];
  if (boss && character.element === boss.weak) labels.push("有利属性");
  if (cooldownNames.has(character.name)) labels.push("CT短縮候補");
  if (healerNames.has(character.name)) labels.push("回復候補");
  if (gaugeNames.has(character.name) || ["RL", "SR"].includes(character.weapon)) labels.push("ゲージ候補");
  return labels.length ? labels.join("・") : `B${character.bursts.join("/") || "?"}候補`;
}

export function buildTeam(purpose: Purpose, characters: CharacterSummary[], records: Record<string, NikkeRecord>): TeamSuggestion {
  const owned = characters.filter((character) => records[character.id]?.owned);
  const boss = purpose === "campaign" ? null : bosses[purpose];
  const chosen = assemble(owned, boss);
  const reference = assemble(characters, boss);
  const stages = new Set(chosen.flatMap((character) => character.bursts));
  const fullBurst = (["I", "II", "III"] as BurstStage[]).every((stage) => stages.has(stage));
  const sustained = (stage: BurstStage) => {
    const reusable = chosen.filter((character) => character.bursts.includes(stage) && !isOriginalRedHood(character));
    if (stage === "III") return reusable.length >= 2 || reusable.some((character) => (burstCooldown[character.name] ?? 40) <= 20);
    return reusable.some((character) => burstCooldown[character.name] === 20)
      || reusable.filter((character) => (burstCooldown[character.name] ?? 40) <= 40).length >= 2;
  };
  const sustainedCycle = fullBurst && sustained("I") && sustained("II") && sustained("III");
  const hasHealing = chosen.some((character) => healerNames.has(character.name));
  const hasCooldown = chosen.some((character) => cooldownNames.has(character.name));
  const hasGauge = chosen.some((character) => gaugeNames.has(character.name) || ["RL", "SR"].includes(character.weapon));
  const reasons = [
    "所持登録されたニケだけから選出し、レベル・スキル・装備・戦闘力などの育成値は順位に使用していません。",
    fullBurst ? "バーストⅠ→Ⅱ→Ⅲが成立します。" : "バースト段階が不足しています。",
    sustainedCycle ? "既知のCTと交互使用条件では継続バーストできる構成です。" : "CTまたは再突入条件により、継続バーストは保証できません。",
    hasCooldown ? "代表的なクールタイム短縮候補を含めました。" : "既知のクールタイム短縮役は未採用です。",
    hasHealing ? "代表的な回復・維持役候補を含めました。" : "既知の回復役が見つからないため火力寄りです。",
    hasGauge ? "RL/SRまたは既知のゲージ生成役を含めました。" : "バーストゲージ生成は要確認です。",
  ];
  if (boss) reasons.push(boss.note);

  const cautions: string[] = [];
  if (owned.length < 5) cautions.push(`所持登録が${owned.length}体のため、5人編成を完成できません。`);
  if (!fullBurst) cautions.push("所持一覧で不足するバースト段階を補ってください。");
  if (chosen.some(isOriginalRedHood)) cautions.push("レッドフードのⅠ・Ⅱ再突入は戦闘中各1回です。通常ローテーションの固定Ⅰ・Ⅱとしては数えていません。");
  if (boss && chosen.some((character) => character.element === boss.dangerous)) cautions.push("ボスから大きな属性ダメージを受ける可能性があるニケを含みます。耐久を実戦確認してください。");
  cautions.push("APIは最適編成を返しません。代表的役割を登録した端末内ルールであり、個別ボス行動・全スキル相互作用・ダメージは未再現です。");

  const alternatives = sortedPool(owned, boss).filter((entry) => !chosen.includes(entry.character)).slice(0, 5)
    .map((entry) => `${entry.character.name}（${roleDescription(entry.character, boss)}）`);
  return {
    title: purposes.find((item) => item.id === purpose)?.label ?? purpose,
    characterIds: chosen.map((character) => character.id),
    referenceCharacterIds: reference.map((character) => character.id),
    mode: !fullBurst || chosen.length < 5 ? "編成不足" : purpose !== "campaign" || !sustainedCycle ? "手動推奨" : "フルオート向け",
    reasons,
    cautions,
    alternatives,
  };
}
