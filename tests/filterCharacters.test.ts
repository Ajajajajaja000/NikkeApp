import { describe, expect, it } from "vitest";
import type { CharacterSummary, NikkeRecord } from "../src/types";
import { filterCharacters } from "../src/rules/filterCharacters";

const catalog: CharacterSummary[] = [
  { id: "447001", resourceId: 470, name: "レッドフード", rarity: "SSR", class: "Attacker", bursts: ["I", "II", "III"], corporation: "PILGRIM", element: "Iron", weapon: "SR", source: "fallback" },
  { id: "201601", resourceId: 16, name: "ラピ：レッドフード", rarity: "SSR", class: "Attacker", bursts: ["III"], corporation: "ELYSION", element: "Fire", weapon: "MG", source: "fallback" },
  { id: "108201", resourceId: 82, name: "リター", rarity: "SSR", class: "Supporter", bursts: ["I"], corporation: "MISSILIS", element: "Iron", weapon: "SMG", source: "fallback" },
];
const records: Record<string, NikkeRecord> = { "447001": { owned: true, favorite: false }, "108201": { owned: true, favorite: false } };
const all = { query: "", owned: "all" as const, element: "all", corporation: "all", weapon: "all", burst: "all" as const };

describe("filterCharacters", () => {
  it("日本語部分一致と所持状態を同時に絞り込む", () => {
    const result = filterCharacters(catalog, records, { ...all, query: "レッドフード", owned: "owned" });
    expect(result.map((item) => item.id)).toEqual(["447001"]);
  });

  it("属性・企業・武器・バーストをAND条件にする", () => {
    const result = filterCharacters(catalog, records, { ...all, element: "Iron", corporation: "MISSILIS", weapon: "SMG", burst: "I" });
    expect(result.map((item) => item.name)).toEqual(["リター"]);
  });

  it("絞り込み後も実装が新しい順に並べる", () => {
    const result = filterCharacters(catalog, records, all);
    expect(result.map((item) => item.name)).toEqual(["ラピ：レッドフード", "レッドフード", "リター"]);
  });
});
