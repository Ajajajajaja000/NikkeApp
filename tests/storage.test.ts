import { afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultData, loadAppData, saveAppData, validateImport } from "../src/storage";

function useMemoryStorage() {
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("backup schema", () => {
  it("エクスポート相当JSONを再検証できる", () => {
    const data = createDefaultData();
    data.profile.records["447001"] = { owned: true, favorite: true, displayName: "レッドフード" };
    const restored = validateImport(JSON.parse(JSON.stringify(data)));
    expect(restored.profile.records["447001"].owned).toBe(true);
  });

  it("不正なバージョンを拒否する", () => {
    expect(() => validateImport({ version: 99, profile: {} })).toThrow(/バージョン2または3/);
  });

  it("バージョン2を3へ移行する", () => {
    const old = { ...createDefaultData(), version: 2 };
    old.profile.records.x = { owned: true, favorite: false, skills: [1, 1, 1], cube: { name: "なし", level: 0 } };
    const migrated = validateImport(JSON.parse(JSON.stringify(old)));
    expect(migrated.version).toBe(3);
    expect(migrated.profile.records.x.skills).toBeUndefined();
    expect(migrated.profile.records.x.cube).toBeUndefined();
  });

  it("再読み込み相当でも所持・手入力記録を復元する", () => {
    useMemoryStorage();
    const data = createDefaultData();
    data.profile.records["447001"] = { owned: true, favorite: true, displayName: "レッドフード", level: 321, notes: "API停止時も保持" };
    saveAppData(data);
    const restored = loadAppData();
    expect(restored.profile.records["447001"]).toMatchObject({ owned: true, level: 321, notes: "API停止時も保持" });
  });
});
