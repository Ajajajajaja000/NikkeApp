import type { CollectionRecord, CoreDustState, CubeRecord, GearRecord, GearSlot, NikkeRecord } from "../types";

export function effectiveLevel(record: NikkeRecord | undefined): number {
  return record?.level ?? record?.imported?.level ?? 1;
}

export function effectiveLimitBreak(record: NikkeRecord | undefined): number {
  return record?.limitBreak ?? record?.imported?.limitBreak ?? 0;
}

export function effectiveSkills(record: NikkeRecord | undefined): [number, number, number] {
  return record?.skills ?? record?.imported?.skills ?? [1, 1, 1];
}

export function effectiveGear(record: NikkeRecord | undefined, slot: GearSlot): GearRecord {
  return record?.gear?.[slot] ?? record?.imported?.gear?.[slot] ?? { tier: "未設定", level: 0, overload: false };
}

export function effectiveCube(record: NikkeRecord | undefined): CubeRecord {
  return record?.cube ?? record?.imported?.cube ?? { name: "なし", level: 0 };
}

export function effectiveCollection(record: NikkeRecord | undefined): CollectionRecord {
  return record?.collection ?? record?.imported?.collection ?? { rarity: "なし", level: 0, treasure: false };
}

export function coreDustForLevel(targetLevel: number): number {
  if (targetLevel < 201) return 0;
  if (targetLevel <= 350) return 10_000;
  if (targetLevel <= 400) return 11_000;
  if (targetLevel <= 450) return 12_000;
  if (targetLevel <= 500) return 13_000;
  if (targetLevel <= 550) return 14_000;
  if (targetLevel <= 600) return 15_000;
  if (targetLevel <= 650) return 16_000;
  if (targetLevel <= 700) return 17_000;
  if (targetLevel <= 750) return 18_000;
  if (targetLevel <= 800) return 19_000;
  return 20_000;
}

export function calculateCoreDust(state: CoreDustState) {
  let required = 0;
  for (let level = Math.max(201, state.currentLevel + 1); level <= state.targetLevel; level += 1) required += coreDustForLevel(level);
  const caseHours = state.cases.h1 + state.cases.h2 * 2 + state.cases.h8 * 8 + state.cases.h12 * 12 + state.cases.h24 * 24;
  const available = state.currentDust + Math.floor(caseHours * state.hourlyRate);
  const shortage = Math.max(0, required - available);
  const days = state.hourlyRate > 0 ? shortage / state.hourlyRate / 24 : null;
  return { required, caseHours, available, shortage, days };
}

export function growthShortages(record: NikkeRecord): string[] {
  const target = record.target;
  if (!target) return [];
  const shortages: string[] = [];
  const skills = effectiveSkills(record);
  const skillGap = target.skills.map((value, index) => Math.max(0, value - skills[index]));
  if (skillGap.some(Boolean)) shortages.push(`スキル不足 ${skillGap.join(" / ")}`);
  const slots: GearSlot[] = ["head", "chest", "arms", "legs"];
  const gear = slots.map((slot) => effectiveGear(record, slot));
  const overload = gear.filter((item) => item.overload).length;
  if (overload < target.overloadCount) shortages.push(`オバロ あと${target.overloadCount - overload}部位`);
  const cubeLevel = effectiveCube(record).level;
  if (cubeLevel < target.cubeLevel) shortages.push(`キューブ あと${target.cubeLevel - cubeLevel}Lv`);
  const tierOrder = ["未設定", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T9企業", "OL"];
  const targetIndex = tierOrder.indexOf(target.gearTier);
  const underGear = gear.filter((item) => tierOrder.indexOf(item.tier) < targetIndex).length;
  if (underGear) shortages.push(`${target.gearTier}未満 ${underGear}部位`);
  return shortages;
}
