import type { GearSlot, NikkeRecord, OverloadTarget } from "../types";
import type { OverloadRecommendation } from "../data/overloadRecommendations";
import { effectiveGear } from "./growth";

export type OverloadRollStyle = "normal" | "blue" | "black";

export function overloadRollStyle(rank: number | undefined): OverloadRollStyle {
  if (rank === 15) return "black";
  if (rank !== undefined && rank >= 12 && rank <= 14) return "blue";
  return "normal";
}

function normalizeEffect(value: string) {
  return value.replace(/増加|アップ|系|\s/g, "");
}

export function optionMatchesPriority(optionName: string, priorityEffect: string) {
  const option = normalizeEffect(optionName);
  const priority = normalizeEffect(priorityEffect);
  return option.length >= 3 && (priority.includes(option) || option.includes(priority));
}

export function expandPriorityEffect(effect: string) {
  const parts = effect.split(/[・、]/).filter(Boolean);
  return parts.map((part, index) => {
    if (part === "ダメージ" && parts[index - 1]?.startsWith("クリティカル")) return "クリティカルダメージ";
    if (part === "有利コード") return "有利コードダメージ";
    return part;
  });
}

export function parseOverloadTarget(effect: string, target: string): OverloadTarget {
  const priority = /残り|次点|候補/.test(target) ? "optional" : "required";
  if (/避ける|不要|非推奨|付けない/.test(target)) return { effect, condition: { type: "absent" }, priority: "required" };
  const percent = target.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percent) return { effect, condition: { type: "percent", minimum: Number(percent[1]) }, priority };
  const range = target.match(/(\d+)\s*[〜～-]\s*(\d+)\s*枠/);
  if (range) return { effect, condition: { type: "lines", minimum: Number(range[1]), recommended: Number(range[2]) }, priority };
  const lines = target.match(/(\d+)\s*枠/);
  if (lines) return { effect, condition: { type: "lines", minimum: Number(lines[1]) }, priority };
  return { effect, condition: { type: "present" }, priority };
}

export function overloadTargetLabel(target: OverloadTarget) {
  const condition = target.condition;
  if (condition.type === "absent") return "付けない";
  if (condition.type === "present") return "付いていればOK";
  if (condition.type === "percent") return `合計${condition.minimum}%以上`;
  return condition.recommended && condition.recommended !== condition.minimum
    ? `${condition.minimum}〜${condition.recommended}枠`
    : `${condition.minimum}枠`;
}

export interface OverloadGoalRow {
  effect: string;
  target: string;
  current: number;
  currentPercent?: number;
  minimum?: number;
  kind: "required" | "optional" | "avoid";
  met: boolean;
  unknown: boolean;
}

export function effectiveOverloadTargets(record: NikkeRecord, recommendation: OverloadRecommendation | undefined): OverloadTarget[] {
  return record.target?.overloadGoals ?? recommendation?.priorities.map(({ effect, target }) => parseOverloadTarget(effect, target)) ?? [];
}

export function optionMatchesTargets(optionName: string, targets: OverloadTarget[]) {
  return targets.some((target) => target.condition.type !== "absent"
    && expandPriorityEffect(target.effect).some((effect) => optionMatchesPriority(optionName, effect)));
}

export function assessOverload(record: NikkeRecord, recommendationOrTargets: OverloadRecommendation | OverloadTarget[] | undefined) {
  const slots: GearSlot[] = ["head", "chest", "arms", "legs"];
  const gear = slots.map((slot) => effectiveGear(record, slot));
  const options = gear.flatMap((item) => item.options ?? []);
  const priorities = Array.isArray(recommendationOrTargets) ? recommendationOrTargets : effectiveOverloadTargets(record, recommendationOrTargets);
  const goals: OverloadGoalRow[] = priorities.flatMap((priority) => {
    const avoid = priority.condition.type === "absent";
    const optional = priority.priority === "optional";
    const minimum = priority.condition.type === "lines" || priority.condition.type === "percent" ? priority.condition.minimum : undefined;
    return expandPriorityEffect(priority.effect).map((effect) => {
      const matched = options.filter((option) => optionMatchesPriority(option.name, effect));
      const current = matched.length;
      const currentPercent = matched.reduce((sum, option) => sum + (option.value ?? 0), 0);
      const unknown = priority.condition.type === "percent" && matched.some((option) => option.value === undefined);
      const kind: OverloadGoalRow["kind"] = avoid ? "avoid" : optional ? "optional" : "required";
      const met = avoid ? current === 0
        : priority.condition.type === "percent" ? !unknown && currentPercent >= priority.condition.minimum
          : priority.condition.type === "lines" ? current >= priority.condition.minimum
            : current > 0;
      return { effect, target: overloadTargetLabel(priority), current, currentPercent, minimum, kind, met, unknown };
    });
  });
  const matchedLines = options.filter((option) => goals.some((goal) => goal.kind !== "avoid" && optionMatchesPriority(option.name, goal.effect))).length;
  const blackLines = options.filter((option) => overloadRollStyle(option.rank) === "black").length;
  const blueLines = options.filter((option) => overloadRollStyle(option.rank) === "blue").length;
  const next = goals.find((goal) => goal.kind === "avoid" && !goal.met)
    ?? goals.find((goal) => goal.kind === "required" && !goal.met)
    ?? goals.find((goal) => goal.kind === "optional" && !goal.met);
  const nextAction = next
    ? next.kind === "avoid" ? `${next.effect}が${next.current}本あります。効果変更の候補です。`
      : next.unknown ? `${next.effect}の数値を取得できないため、ゲーム内で確認してください。`
        : next.currentPercent !== undefined && next.target.includes("%") ? `${next.effect}は現在合計${next.currentPercent.toFixed(1)}%です。${next.target}が目標です。`
      : next.minimum !== undefined ? `${next.effect}をあと${Math.max(0, next.minimum - next.current)}本そろえるのが次の目標です。`
        : `${next.effect}を1本付けるのが次の目標です。`
    : goals.length ? "推奨効果は最低目標を満たしています。次は青字・黒帯の数値厳選です。"
      : "このキャラは推奨効果の本数をまだ確認できていません。";
  return {
    overloadParts: gear.filter((item) => item.overload).length,
    totalLines: options.length,
    matchedLines,
    blueLines,
    blackLines,
    goals,
    nextAction,
  };
}
