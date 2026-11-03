import { afterEach, describe, expect, it, vi } from "vitest";
import { createConnection, loadConnection, saveConnection, shouldAutoSync } from "../src/blablaConnection";
import { parseRosterPayload } from "../src/api/nikkeApi";

afterEach(() => vi.unstubAllGlobals());

describe("BlablaLink詳細同期", () => {
  it("72時間後に自動同期し、失敗後6時間は再試行しない", () => {
    const base = createConnection("public-id");
    const now = Date.parse("2026-11-03T12:00:00Z");
    expect(shouldAutoSync({ ...base, lastSuccessAt: "2026-10-31T11:59:59Z" }, now)).toBe(true);
    expect(shouldAutoSync({ ...base, lastSuccessAt: "2026-11-01T12:00:00Z" }, now)).toBe(false);
    expect(shouldAutoSync({ ...base, lastAttemptAt: "2026-11-03T10:00:00Z", lastError: "502" }, now)).toBe(false);
  });

  it("接続IDはアプリデータとは別のキーで保存する", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) });
    saveConnection(createConnection("public-openid"));
    expect(loadConnection()?.openid).toBe("public-openid");
  });

  it("初回取り込み失敗だけが残った接続を入力前の状態へ戻す", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) });
    saveConnection({ ...createConnection("failed-openid"), lastAttemptAt: "2026-11-03T00:00:00Z", lastError: "取り込み失敗" });
    expect(loadConnection()).toBeNull();
    expect(values.size).toBe(0);
  });

  it("原始rosterをID付きの装備・オバロ・キューブ・コレクションへ変換する", () => {
    const roster = { areas: [{ area: 83, characters: [{ name_code: 5001, lv: 321, grade: 3, core: 2, combat: 123456 }], details: [{ name_code: 5001, skill1_lv: 10, skill2_lv: 9, ulti_skill_lv: 10, head_equip_tid: 3121001, head_equip_lv: 5, head_equip_option1_id: 7000501, cube_tid: 1000301, cube_lv: 7, favorite_item_tid: 100101, favorite_item_lv: 12 }], stateEffects: [{ id: 7000501, function_details: [{ function_type: "StatAtk", function_value: 1198 }] }] }] };
    const parsed = parseRosterPayload(roster, { equips: [{ id: 3121001, name: "企業バイザー", rare: "T10", corporation: "PILGRIM" }] }, { options: [{ id: 7000501, name: "有利コードダメージ増加", rank: 1 }] }, { cubes: [{ id: 1000301, name: "アサルトキューブ" }] }, { favorites: [{ id: 100101, name: "ぬいぐるみ", rare: "R" }] }, [{ name_code: 5001, resource_id: 102 }], new Date("2026-11-03T00:00:00Z"));
    const row = parsed.rows[0];
    expect(row.resourceId).toBe(102);
    expect(row.snapshot.skills).toEqual([10, 9, 10]);
    expect(row.snapshot.gear?.head).toMatchObject({ id: 3121001, name: "企業バイザー", corporation: "PILGRIM", level: 5, overload: true });
    expect(row.snapshot.gear?.head.options?.[0]).toMatchObject({ id: 7000501, rank: 1, value: 11.98, unit: "%" });
    expect(row.snapshot.cube).toMatchObject({ id: 1000301, name: "アサルトキューブ", level: 7 });
    expect(row.snapshot.collection).toMatchObject({ id: 100101, rarity: "R", level: 12, treasure: false });
  });

  it("詳細が欠けた応答を適用しない", () => {
    expect(() => parseRosterPayload({ areas: [{ characters: [{ name_code: 1 }], details: [], stateEffects: [] }] }, {}, {}, {}, {}, [])).toThrow(/詳細データが不足/);
  });
});
