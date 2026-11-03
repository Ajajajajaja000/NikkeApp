import { describe, expect, it } from "vitest";
import type { BurstStage, CharacterSummary, NikkeRecord } from "../src/types";
import { buildTeam } from "../src/rules/teamBuilder";

const character = (id: string, name: string, bursts: BurstStage[], element = "Iron"): CharacterSummary => ({
  id, name, bursts, element, rarity: "SSR", class: bursts.includes("III") ? "Attacker" : "Supporter", corporation: "TEST", weapon: bursts.includes("III") ? "AR" : "SMG", source: "fallback",
});
const owned = (level: number, skills: [number, number, number] = [7, 7, 7]): NikkeRecord => ({ owned: true, favorite: false, level, skills });

describe("buildTeam", () => {
  it("継続可能なI→II→IIIを左から並べ、キャンペーンをフルオート判定する", () => {
    const catalog = [
      character("1", "リター", ["I"]),
      character("2", "クラウン", ["II"]),
      character("3", "アタッカーA", ["III"]),
      character("4", "アタッカーB", ["III"]),
      character("5", "ナガ", ["II"]),
    ];
    const records = Object.fromEntries(catalog.map((item) => [item.id, owned(300)]));
    const result = buildTeam("campaign", catalog, records);
    expect(result.mode).toBe("フルオート向け");
    expect(result.characterIds.slice(0, 4)).toEqual(["1", "2", "3", "4"]);
  });

  it("未育成キャラより育成済みキャラを優先する", () => {
    const catalog = [
      character("1", "リター", ["I"]), character("2", "クラウン", ["II"]),
      character("3", "未育成の強キャラ", ["III"]), character("4", "育成済みA", ["III"]), character("5", "育成済みB", ["III"]),
    ];
    const records = { "1": owned(300), "2": owned(300), "3": owned(1, [1, 1, 1]), "4": owned(300, [10, 10, 10]), "5": owned(280, [9, 9, 9]) };
    const result = buildTeam("campaign", catalog, records);
    expect(result.characterIds.slice(2, 4)).toEqual(["4", "5"]);
    expect(result.characterIds.indexOf("3")).toBeGreaterThan(result.characterIds.indexOf("5"));
  });

  it("レッドフードの再突入だけを継続B1として扱わない", () => {
    const catalog = [
      character("447001", "レッドフード", ["I", "II", "III"]),
      character("2", "クラウン", ["II"]), character("3", "A", ["III"]), character("4", "B", ["III"]), character("5", "C", ["III"]),
    ];
    const records = Object.fromEntries(catalog.map((item) => [item.id, owned(300)]));
    const result = buildTeam("campaign", catalog, records);
    expect(result.mode).toBe("手動推奨");
    expect(result.cautions.some((item) => item.includes("再突入"))).toBe(true);
  });
});
