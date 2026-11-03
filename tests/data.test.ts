import { describe, expect, it } from "vitest";
import { mergeImportedRecord, normalizeCharacter } from "../src/api/nikkeApi";

describe("character identity and import", () => {
  it("レッドフードとラピ：レッドフードを別IDで保持する", () => {
    const redHood = normalizeCharacter({ id: 447001, name: "レッドフード", burst: ["III"], weapon: { type: "SR" } });
    const rapi = normalizeCharacter({ id: 201601, name: "ラピ：レッドフード", burst: ["III"], weapon: { type: "MG" } });
    expect(redHood.id).not.toBe(rapi.id);
    expect(redHood.name).not.toBe(rapi.name);
  });

  it("APIのAllバーストをI・II・IIIとして扱う", () => {
    const redHood = normalizeCharacter({ id: 447001, name: "レッドフード", burst: "All", weapon: { type: "SR" } });
    expect(redHood.bursts).toEqual(["I", "II", "III"]);
  });

  it("取り込み時に手入力を上書きしない", () => {
    const merged = mergeImportedRecord({ owned: true, favorite: true, level: 320, skills: [10, 9, 10], notes: "手入力" }, { level: 300, combatPower: 123456, fetchedAt: "2026-11-03T00:00:00Z", source: "test" });
    expect(merged.level).toBe(320);
    expect(merged.skills).toEqual([10, 9, 10]);
    expect(merged.notes).toBe("手入力");
    expect(merged.imported?.level).toBe(300);
  });
});
