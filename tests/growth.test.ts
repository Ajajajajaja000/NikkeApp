import { describe, expect, it } from "vitest";
import { calculateCoreDust, coreDustForLevel, growthShortages } from "../src/rules/growth";

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
  it("廃止した装備Tier・オバロ部位数を不足項目に出さない", () => {
    const shortages = growthShortages({
      owned: true,
      favorite: true,
      target: { skills: [7, 7, 7], gearTier: "OL", overloadCount: 4, cubeLevel: 7 },
      imported: { skills: [7, 7, 7], cube: { name: "テスト", level: 7 }, fetchedAt: "2026-11-03T00:00:00Z", source: "test" },
    });
    expect(shortages).toEqual([]);
  });
});
