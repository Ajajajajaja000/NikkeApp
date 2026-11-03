import type { BurstStage, CharacterSummary, NikkeRecord } from "../types";
import { compareByReleaseOrder } from "../data/releaseOrder";
import { effectiveCombatPower } from "./growth";

export interface RosterFilters {
  query: string;
  owned: "all" | "owned" | "unowned";
  element: string;
  corporation: string;
  weapon: string;
  burst: "all" | BurstStage;
  sort: "release" | "combat";
}

export function filterCharacters(characters: CharacterSummary[], records: Record<string, NikkeRecord>, filters: RosterFilters) {
  const normalized = filters.query.trim().toLocaleLowerCase("ja");
  return characters.filter((character) => {
    const record = records[character.id];
    return (!normalized || character.name.toLocaleLowerCase("ja").includes(normalized))
      && (filters.owned === "all" || (filters.owned === "owned") === Boolean(record?.owned))
      && (filters.element === "all" || character.element === filters.element)
      && (filters.corporation === "all" || character.corporation === filters.corporation)
      && (filters.weapon === "all" || character.weapon === filters.weapon)
      && (filters.burst === "all" || character.bursts.includes(filters.burst));
  }).sort((a, b) => {
    if (filters.sort === "combat") {
      const difference = (effectiveCombatPower(records[b.id]) ?? -1) - (effectiveCombatPower(records[a.id]) ?? -1);
      if (difference !== 0) return difference;
    }
    return compareByReleaseOrder(a.resourceId, b.resourceId);
  });
}
