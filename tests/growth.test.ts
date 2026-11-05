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

  it("resourceIdごとの推奨スキル値を不足判定に使う", () => {
    const recommendation = growthRecommendation(16);
    expect(recommendation?.skills).toEqual([10, 10, 10]);
    expect(recommendation?.agreement).toBe("複数ソース一致");
    const shortages = growthShortages({ owned: true, favorite: true, imported: { skills: [7, 10, 10], fetchedAt: "2026-11-03T00:00:00Z", source: "test" } }, recommendation?.skills);
    expect(shortages).toEqual(["スキル不足 3 / 0 / 0"]);
  });

  it("頻出値と単一ソース参考を区別する", () => {
    expect(growthRecommendation(191)).toMatchObject({ skills: [10, 4, 10], agreement: "複数ソース一致" });
    expect(growthRecommendation(10)?.agreement).toBe("単一ソース参考");
  });

  it("必須オバロ目標の未達を育成目標に含める", () => {
    const record = { owned: true, favorite: true, imported: { skills: [10, 10, 10] as [number, number, number], fetchedAt: "2026-11-03T00:00:00Z", source: "test" } };
    const shortages = growthStatus(record, [10, 10, 10], { resourceId: 1, priorities: [{ effect: "攻撃力増加", target: "1枠", reason: "test", kind: "ideal" }], checked: "2026-11-03", sources: [], classification: "全キャラ表を主基準・複数ソース照合", investmentPriority: "中", reviewStatus: "confirmed" });
    expect(shortages).toContain("オバロ不足 1項目");
  });

  it("厳選不要を目標未設定として扱わない", () => {
    const record = { owned: true, favorite: true, imported: { skills: [10, 10, 10] as [number, number, number], fetchedAt: "2026-11-03T00:00:00Z", source: "test" } };
    const shortages = growthStatus(record, [10, 10, 10], { resourceId: 1, priorities: [], checked: "2026-11-04", sources: [], classification: "全キャラ表を主基準・複数ソース照合", investmentPriority: "厳選不要", reviewStatus: "confirmed" });
    expect(shortages).toEqual([]);
  });

  it("未確認の空欄を厳選不要として扱わない", () => {
    const record = { owned: true, favorite: true, imported: { skills: [10, 10, 10] as [number, number, number], fetchedAt: "2026-11-05T00:00:00Z", source: "test" } };
    const shortages = growthStatus(record, [10, 10, 10], { resourceId: 999, priorities: [], checked: "2026-11-05", sources: [], classification: "未確認", investmentPriority: "未確認", reviewStatus: "unverified" });
    expect(shortages).toContain("オバロ目標未設定");
  });

  it("紅蓮：神殺の実装後スキル目標を使う", () => {
    expect(growthRecommendation(872)).toMatchObject({ skills: [10, 10, 10], agreement: "複数ソース一致", checked: "2026-11-05" });
  });
});
