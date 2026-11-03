import type { AppData, CoreDustState, GearRecord, GearSlot, LocalProfile, NikkeRecord } from "./types";

export const STORAGE_KEY = "nikke-compass:data";

export const defaultCoreDust = (): CoreDustState => ({
  currentLevel: 200,
  targetLevel: 201,
  currentDust: 0,
  hourlyRate: 0,
  cases: { h1: 0, h2: 0, h8: 0, h12: 0, h24: 0 },
});

export const defaultGear = (): Record<GearSlot, GearRecord> => ({
  head: { tier: "未設定", level: 0, overload: false },
  chest: { tier: "未設定", level: 0, overload: false },
  arms: { tier: "未設定", level: 0, overload: false },
  legs: { tier: "未設定", level: 0, overload: false },
});

export const emptyRecord = (): NikkeRecord => ({
  owned: false,
  favorite: false,
  skills: [1, 1, 1],
  gear: defaultGear(),
  cube: { name: "なし", level: 0 },
  collection: { rarity: "なし", level: 0, treasure: false },
  target: { skills: [7, 7, 7], gearTier: "T9", overloadCount: 4, cubeLevel: 7 },
});

const profile = (): LocalProfile => ({ id: "local", name: "この端末", records: {}, savedTeams: [], coreDust: defaultCoreDust() });

export const createDefaultData = (): AppData => ({
  version: 2,
  profile: profile(),
});

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateImport(value: unknown): AppData {
  if (!isObject(value) || value.version !== 2 || !isObject(value.profile)) {
    throw new Error("対応していないバックアップ形式です（データバージョン2が必要です）。");
  }
  const item = value.profile;
  if (typeof item.id !== "string" || typeof item.name !== "string" || !isObject(item.records)) {
    throw new Error("端末データが壊れています。");
  }
  return value as unknown as AppData;
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultData();
    return validateImport(JSON.parse(raw));
  } catch {
    return createDefaultData();
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    if (error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
      throw new Error("Safariの保存容量が不足しています。先にJSONバックアップを作成してください。");
    }
    throw error;
  }
}

export function mergeRecord(base: NikkeRecord | undefined, patch: Partial<NikkeRecord>): NikkeRecord {
  return { ...emptyRecord(), ...base, ...patch };
}
