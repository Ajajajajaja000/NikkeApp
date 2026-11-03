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

function minimumFromTarget(target: string) {
  const match = target.match(/\d+/);
  return match ? Number(match[0]) : undefined;
}

export interface OverloadGoalRow {
  effect: string;
  target: string;
  current: number;
  minimum?: number;
  kind: "required" | "optional" | "avoid";
  met: boolean;
}

export function effectiveOverloadTargets(record: NikkeRecord, recommendation: OverloadRecommendation | undefined): OverloadTarget[] {
  return record.target?.overloadGoals ?? recommendation?.priorities.map(({ effect, target }) => ({ effect, target })) ?? [];
}

export function optionMatchesTargets(optionName: string, targets: OverloadTarget[]) {
  return targets.some((target) => !/避ける|不要/.test(target.target)
    && expandPriorityEffect(target.effect).some((effect) => optionMatchesPriority(optionName, effect)));
}

export function assessOverload(record: NikkeRecord, recommendationOrTargets: OverloadRecommendation | OverloadTarget[] | undefined) {
  const slots: GearSlot[] = ["head", "chest", "arms", "legs"];
  const gear = slots.map((slot) => effectiveGear(record, slot));
  const options = gear.flatMap((item) => item.options ?? []);
  const priorities = Array.isArray(recommendationOrTargets) ? recommendationOrTargets : effectiveOverloadTargets(record, recommendationOrTargets);
  const goals: OverloadGoalRow[] = priorities.flatMap((priority) => {
    const avoid = /避ける|不要/.test(priority.target);
    const optional = /残り|次点|候補/.test(priority.target);
    const minimum = minimumFromTarget(priority.target);
    return expandPriorityEffect(priority.effect).map((effect) => {
      const current = options.filter((option) => optionMatchesPriority(option.name, effect)).length;
      const kind: OverloadGoalRow["kind"] = avoid ? "avoid" : optional ? "optional" : "required";
      const met = avoid ? current === 0 : minimum !== undefined ? current >= minimum : current > 0;
      return { effect, target: priority.target, current, minimum, kind, met };
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
