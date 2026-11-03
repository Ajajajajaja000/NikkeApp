import { describe, expect, it } from "vitest";
import { calculateCoreDust, coreDustForLevel } from "../src/rules/growth";

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
