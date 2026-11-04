import { describe, expect, it } from "vitest";
import type { NikkeRecord } from "../src/types";
import { assessOverload, effectiveOverloadTargets, optionMatchesPriority, optionMatchesTargets, overloadRollStyle } from "../src/rules/overload";
import { overloadRecommendation } from "../src/data/overloadRecommendations";

describe("overload display and goals", () => {
  it("ランク12〜14を青字、15を黒帯として扱う", () => {
    expect(overloadRollStyle(11)).toBe("normal");
    expect(overloadRollStyle(12)).toBe("blue");
    expect(overloadRollStyle(14)).toBe("blue");
    expect(overloadRollStyle(15)).toBe("black");
  });

  it("表記差を吸収して推奨効果と照合する", () => {
    expect(optionMatchesPriority("有利コードダメージ増加", "有利コードダメージ")).toBe(true);
    expect(optionMatchesPriority("最大装弾数増加", "最大装弾数")).toBe(true);
    expect(optionMatchesPriority("防御力増加", "攻撃力増加")).toBe(false);
  });

  it("現在本数と次に狙う推奨効果を自動判定する", () => {
    const record: NikkeRecord = {
      owned: true,
      favorite: true,
      imported: {
        gear: {
          head: { tier: "OL", level: 5, overload: true, options: [{ name: "攻撃力増加", rank: 15, value: 11.81, unit: "%" }] },
          arms: { tier: "OL", level: 5, overload: true, options: [{ name: "最大装弾数増加", rank: 13, value: 68.93, unit: "%" }] },
        },
        fetchedAt: "2026-11-03T00:00:00Z",
        source: "test",
      },
    };
    const result = assessOverload(record, overloadRecommendation(19, "マリアン：クイーン"));
    expect(result.overloadParts).toBe(2);
    expect(result.blackLines).toBe(1);
    expect(result.blueLines).toBe(1);
    expect(result.goals.find((goal) => goal.effect === "攻撃力増加")?.current).toBe(1);
    expect(result.nextAction).toContain("有利コードダメージ");
  });

  it("手動目標を推奨より優先し、装備ラインとの一致を判定する", () => {
    const record: NikkeRecord = { owned: true, favorite: true, target: { overloadGoals: [{ effect: "有利コードダメージ増加", condition: { type: "lines", minimum: 2 }, priority: "required" }] } };
    const targets = effectiveOverloadTargets(record, overloadRecommendation(19, "マリアン：クイーン"));
    expect(targets).toEqual([{ effect: "有利コードダメージ増加", condition: { type: "lines", minimum: 2 }, priority: "required" }]);
    expect(optionMatchesTargets("有利コードダメージ増加", targets)).toBe(true);
    expect(optionMatchesTargets("攻撃力増加", targets)).toBe(false);
  });

  it("妥協候補を自動目標に含めず、付けない効果は目標に含める", () => {
    const record: NikkeRecord = { owned: true, favorite: true };
    const targets = effectiveOverloadTargets(record, overloadRecommendation(15, "アニス：スパークリングサマー"));
    expect(targets.some((target) => target.effect === "クリティカル確率増加")).toBe(false);
    expect(targets.find((target) => target.effect === "最大装弾数増加")?.condition).toEqual({ type: "absent" });
  });

  it("割合目標を枠数と混同せず合計値で判定する", () => {
    const record: NikkeRecord = { owned: true, favorite: true, imported: { gear: {
      head: { tier: "OL", level: 5, overload: true, options: [{ name: "チャージ速度増加", value: 2.9, unit: "%" }] },
      arms: { tier: "OL", level: 5, overload: true, options: [{ name: "チャージ速度増加", value: 2.5, unit: "%" }] },
    }, fetchedAt: "2026-11-03T00:00:00Z", source: "test" } };
    const result = assessOverload(record, [{ effect: "チャージ速度増加", condition: { type: "percent", minimum: 5.1 }, priority: "required" }]);
    expect(result.goals[0]).toMatchObject({ current: 2, currentPercent: 5.4, minimum: 5.1, met: true });
  });

  it("付けない効果が存在すると未達にする", () => {
    const record: NikkeRecord = { owned: true, favorite: true, imported: { gear: {
      head: { tier: "OL", level: 5, overload: true, options: [{ name: "最大装弾数増加", value: 68.9, unit: "%" }] },
    }, fetchedAt: "2026-11-03T00:00:00Z", source: "test" } };
    const result = assessOverload(record, [{ effect: "最大装弾数増加", condition: { type: "absent" }, priority: "required" }]);
    expect(result.goals[0]).toMatchObject({ kind: "avoid", current: 1, met: false });
  });
});
