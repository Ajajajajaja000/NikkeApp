import type { CharacterSummary, NikkeRecord, TeamSuggestion } from "../types";
import { effectiveLevel, effectiveLimitBreak, effectiveSkills } from "./growth";

type Purpose = "campaign" | "kraken" | "mirror" | "indivilla" | "ultra" | "harvester";

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

const supportNames = ["リター", "クラウン", "ナガ", "ドロシー", "ブラン", "ノワール", "ティア", "ラプンツェル"];
const healerNames = ["ラプンツェル", "ナガ", "マルチャーナ", "ヘルム", "ブラン"];
const cooldownNames = ["リター", "ドロシー", "D：キラーワイフ", "ボリューム", "ルージュ"];
const gaugeNames = ["センチ", "アニス", "ジャッカル", "レッドフード"];
const burstCooldown: Record<string, number> = {
  "リター": 20, "ドロシー": 20, "ボリューム": 20, "D：キラーワイフ": 20, "ルージュ": 20,
  "クラウン": 20, "ナガ": 20, "センチ": 20, "ブラン": 40, "ノア": 40, "ラプンツェル": 60,
  "レッドフード": 40,
};

function includesName(name: string, list: string[]) {
  return list.some((part) => name.includes(part));
}

export function investmentScore(record: NikkeRecord | undefined): number {
  if (!record?.owned) return -999;
  const skills = effectiveSkills(record);
  const overload = Object.values(record.gear ?? {}).filter((gear) => gear.overload).length;
  const gearLevels = Object.values(record.gear ?? {}).reduce((sum, gear) => sum + gear.level, 0);
  return Math.min(effectiveLevel(record), 400) * 0.12 + skills.reduce((a, b) => a + b, 0) * 2.2 + overload * 13 + gearLevels * 0.7 + (record.cube?.level ?? 0) * 1.2 + effectiveLimitBreak(record) * 2.5 + (record.combatPower ?? record.imported?.combatPower ?? 0) / 10_000;
}

export function buildTeam(purpose: Purpose, characters: CharacterSummary[], records: Record<string, NikkeRecord>): TeamSuggestion {
  const owned = characters.filter((character) => records[character.id]?.owned);
  const boss = purpose === "campaign" ? null : bosses[purpose];
  const scored = owned.map((character) => {
    let score = investmentScore(records[character.id]);
    if (boss && character.element === boss.weak) score += 22;
    if (boss && character.element === boss.dangerous) score -= 18;
    if (includesName(character.name, supportNames)) score += 7;
    if (includesName(character.name, cooldownNames)) score += 9;
    if ((character.bursts.includes("I") || character.bursts.includes("II")) && burstCooldown[character.name] === 20) score += 12;
    return { character, score };
  }).sort((a, b) => b.score - a.score);

  const chosen: CharacterSummary[] = [];
  const take = (stage: "I" | "II" | "III", count = 1) => {
    // 段階可変キャラ（レッドフード等）を固定段階の代わりに常用しない。
    const candidates = [...scored].sort((a, b) => {
      const dedicated = Number(a.character.bursts.length === 1) - Number(b.character.bursts.length === 1);
      if (dedicated) return -dedicated;
      return b.score - a.score;
    });
    for (const entry of candidates) {
      if (chosen.length >= 5 || chosen.includes(entry.character) || !entry.character.bursts.includes(stage)) continue;
      chosen.push(entry.character);
      if (chosen.filter((item) => item.bursts.includes(stage)).length >= count) break;
    }
  };

  // オートでは左から使用可能なバーストが選ばれるため、主力I→II→III→次のIIIの順で置く。
  take("I");
  take("II");
  take("III", 1);
  take("III", 2);
  for (const entry of scored) {
    if (chosen.length >= 5) break;
    if (!chosen.includes(entry.character)) chosen.push(entry.character);
  }

  const stages = new Set(chosen.flatMap((character) => character.bursts));
  const fullBurst = ["I", "II", "III"].every((stage) => stages.has(stage as "I" | "II" | "III"));
  const sustained = (stage: "I" | "II" | "III") => {
    const candidates = chosen.filter((character) => character.bursts.includes(stage));
    const reusable = candidates.filter((character) => !(character.name.includes("レッドフード") && character.bursts.length > 1));
    if (stage === "III") return reusable.length >= 2 || reusable.some((character) => (burstCooldown[character.name] ?? 40) <= 20);
    return reusable.some((character) => burstCooldown[character.name] === 20)
      || reusable.filter((character) => (burstCooldown[character.name] ?? 40) <= 40).length >= 2;
  };
  const sustainedCycle = fullBurst && sustained("I") && sustained("II") && sustained("III");
  const hasHealing = chosen.some((character) => includesName(character.name, healerNames));
  const hasCooldown = chosen.some((character) => includesName(character.name, cooldownNames));
  const hasGauge = chosen.some((character) => includesName(character.name, gaugeNames) || ["RL", "SR"].includes(character.weapon));
  const reasons = [
    fullBurst ? "バーストⅠ→Ⅱ→Ⅲが成立します。" : "バースト段階が不足しています。",
    sustainedCycle ? "20秒周期または交互使用で継続バーストできる構成です。" : "クールタイムまたは再突入条件により、継続バーストは保証できません。",
    hasCooldown ? "クールタイム短縮候補を含めました。" : "クールタイム短縮役は未採用です。",
    hasHealing ? "回復・維持役候補を含めました。" : "回復役が見つからないため火力寄りです。",
    hasGauge ? "RL/SRまたは既知のゲージ生成役を含めました。" : "バーストゲージ生成は要確認です。",
  ];
  if (boss) reasons.push(boss.note);

  const cautions: string[] = [];
  if (owned.length < 5) cautions.push(`所持登録が${owned.length}体のため、5人編成を完成できません。`);
  if (!fullBurst) cautions.push("所持一覧で不足するバースト段階を補ってください。");
  if (chosen.some((character) => character.name.includes("レッドフード") && character.bursts.length > 1)) cautions.push("レッドフードのⅠ・Ⅱ再突入は戦闘中各1回です。通常ローテーションの固定Ⅰ・Ⅱとしては数えていません。");
  if (boss && chosen.some((character) => character.element === boss.dangerous)) cautions.push("ボスから大きな属性ダメージを受ける可能性があるニケを含みます。耐久を実戦確認してください。");
  cautions.push("スキル固有の発動順・再突入・遮蔽・部位破壊は完全再現していません。最終確認はゲーム内で行ってください。");

  const alternatives = scored.filter((entry) => !chosen.includes(entry.character)).slice(0, 5).map((entry) => `${entry.character.name}（育成・属性スコア ${Math.round(entry.score)}）`);
  const average = chosen.length ? chosen.reduce((sum, character) => sum + investmentScore(records[character.id]), 0) / chosen.length : 0;
  return {
    title: purposes.find((item) => item.id === purpose)?.label ?? purpose,
    characterIds: chosen.map((character) => character.id),
    mode: !fullBurst || chosen.length < 5 ? "編成不足" : boss || !sustainedCycle ? "手動推奨" : "フルオート向け",
    score: Math.round(average),
    reasons,
    cautions,
    alternatives,
  };
}
