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
});

const profile = (): LocalProfile => ({ id: "local", name: "この端末", records: {}, savedTeams: [], coreDust: defaultCoreDust() });

export const createDefaultData = (): AppData => ({
  version: 3,
  profile: profile(),
});

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateImport(value: unknown): AppData {
  if (!isObject(value) || (value.version !== 2 && value.version !== 3) || !isObject(value.profile)) {
    throw new Error("対応していないバックアップ形式です（データバージョン2または3が必要です）。");
  }
  const item = value.profile;
  if (typeof item.id !== "string" || typeof item.name !== "string" || !isObject(item.records)) {
    throw new Error("端末データが壊れています。");
  }
  if (value.version === 2) {
    const migrated = structuredClone(value) as Record<string, unknown>;
    migrated.version = 3;
    const migratedProfile = migrated.profile as Record<string, unknown>;
    const records = migratedProfile.records as Record<string, Record<string, unknown>>;
    for (const record of Object.values(records)) {
      // v2では所持切替だけでも初期値が「手入力」として保存された。編集日時がない初期値だけを除き、v3の取込値を表示できるようにする。
      if (record.manualUpdatedAt) continue;
      if (JSON.stringify(record.skills) === "[1,1,1]") delete record.skills;
      if (JSON.stringify(record.cube) === JSON.stringify({ name: "なし", level: 0 })) delete record.cube;
      if (JSON.stringify(record.collection) === JSON.stringify({ rarity: "なし", level: 0, treasure: false })) delete record.collection;
      if (record.gear && JSON.stringify(record.gear) === JSON.stringify(defaultGear())) delete record.gear;
    }
    return migrated as unknown as AppData;
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
