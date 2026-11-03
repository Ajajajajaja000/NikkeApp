import { describe, expect, it } from "vitest";
import { calculateCoreDust, coreDustForLevel, growthShortages, growthStatus } from "../src/rules/growth";
import { growthRecommendation } from "../src/data/growthRecommendations";

describe("core dust calculator", () => {
  it("レベル帯の境界で必要数を切り替える", () => {
    expect(coreDustForLevel(350)).toBe(10_000);
    expect(coreDustForLevel(351)).toBe(11_000);
    expect(coreDustForLevel(401)).toBe(12_000);
    expect(coreDustForLevel(551)).toBe(15_000);
  });

  it("時間ケースと基地産出を不足数へ反映する", () => {
    const result = calculateCoreDust({ currentLevel: 349, targetLevel: 351, currentDust: 4_000, hourlyRate: 50, cases: { h1: 2, h2: 1, h8: 0, h12: 0, h24: 0 } });
    expect(result.required).toBe(21_000);
    expect(result.caseHours).toBe(4);
    expect(result.available).toBe(4_200);
    expect(result.shortage).toBe(16_800);
  });
});

describe("growth shortages", () => {
  it("廃止した装備Tier・オバロ部位数・キューブLvを不足項目に出さない", () => {
    const shortages = growthShortages({
      owned: true,
      favorite: true,
      target: { skills: [7, 7, 7], gearTier: "OL", overloadCount: 4, cubeLevel: 7 },
      imported: { skills: [7, 7, 7], cube: { name: "テスト", level: 7 }, fetchedAt: "2026-11-03T00:00:00Z", source: "test" },
    });
    expect(shortages).toEqual([]);
  });

  it("resourceIdごとの公開推奨スキル値を不足判定に使う", () => {
    const recommendation = growthRecommendation(16);
    expect(recommendation?.skills).toEqual([10, 10, 10]);
    const shortages = growthShortages({ owned: true, favorite: true, imported: { skills: [7, 10, 10], fetchedAt: "2026-11-03T00:00:00Z", source: "test" } }, recommendation?.skills);
    expect(shortages).toEqual(["スキル不足 3 / 0 / 0"]);
  });

  it("必須オバロ目標の未達を育成目標に含める", () => {
    const record = { owned: true, favorite: true, imported: { skills: [10, 10, 10] as [number, number, number], fetchedAt: "2026-11-03T00:00:00Z", source: "test" } };
    const shortages = growthStatus(record, [10, 10, 10], { resourceId: 1, priorities: [{ effect: "攻撃力増加", target: "1枠", reason: "test" }], cubes: [], checked: "2026-11-03", sources: [], classification: "Nikkers公開ビルド情報（静的確認）" });
    expect(shortages).toContain("オバロ不足 1項目");
  });
});
