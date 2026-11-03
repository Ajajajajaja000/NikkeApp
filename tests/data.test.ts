import { describe, expect, it } from "vitest";
import { blablaErrorMessage, extractBlablaId, mergeImportedRecord, normalizeCharacter } from "../src/api/nikkeApi";

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

  it("Base64パディング付きBlablaLink URLと保存済みopenidを解析する", () => {
    const id = "sampleOpenid123==";
    expect(extractBlablaId(`https://www.blablalink.com/user?openid=${id}`)).toBe(id);
    expect(extractBlablaId(id)).toBe(id);
    expect(extractBlablaId(`[共有URL](https://www.blablalink.com/user?openid=${id})`)).toBe(id);
    expect(extractBlablaId(`\u200Bhttps://www.blablalink.com/user?openid=${id}。`)).toBe(id);
  });

  it("不正な文字列ではブラウザー固有エラーをそのまま表示しない", () => {
    expect(() => extractBlablaId("openidのうしろ")).toThrow("BlablaLink共有URLを確認してください");
    expect(blablaErrorMessage(new TypeError("Failed to construct 'URL': Invalid URL"))).toMatch(/共有URLを読み取れません/);
    expect(blablaErrorMessage(new TypeError("Load failed"))).toMatch(/通信できません/);
  });

  it("取り込み時に手入力を上書きしない", () => {
    const merged = mergeImportedRecord({ owned: true, favorite: true, level: 320, skills: [10, 9, 10], cube: { name: "手入力キューブ", level: 9 }, notes: "手入力" }, { level: 300, combatPower: 123456, cube: { id: 1, name: "APIキューブ", level: 7 }, fetchedAt: "2026-11-03T00:00:00Z", source: "test" });
    expect(merged.level).toBe(320);
    expect(merged.skills).toEqual([10, 9, 10]);
    expect(merged.notes).toBe("手入力");
    expect(merged.cube?.name).toBe("手入力キューブ");
    expect(merged.imported?.cube?.name).toBe("APIキューブ");
    expect(merged.imported?.level).toBe(300);
  });
});
