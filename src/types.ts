export type BurstStage = "I" | "II" | "III";
export type GearSlot = "head" | "chest" | "arms" | "legs";
export type GrowthPriority = "high" | "medium" | "low";

export interface CharacterSummary {
  id: string;
  resourceId?: number;
  name: string;
  rarity: string;
  class: string;
  bursts: BurstStage[];
  corporation: string;
  element: string;
  weapon: string;
  icon?: string;
  source: "nikke-api" | "fallback";
}

export interface OverloadOption {
  id?: number;
  name: string;
  rank?: number;
  value?: number;
  unit?: string;
}

export interface CharacterSkill {
  slot: string;
  name: string;
  description: string;
  cooldown?: number;
}

export interface CharacterDetail extends CharacterSummary {
  skills: CharacterSkill[];
  fetchedAt: string;
}

export interface GearRecord {
  id?: number;
  name?: string;
  icon?: string;
  corporation?: string;
  tier: string;
  level: number;
  overload: boolean;
  options?: OverloadOption[];
}

export interface CubeRecord { id?: number; name: string; level: number }
export interface CollectionRecord {
  id?: number;
  name?: string;
  rarity: "なし" | "R" | "SR" | "SSR";
  level: number;
  treasure: boolean;
}

export interface ImportedSnapshot {
  level?: number;
  limitBreak?: number;
  combatPower?: number;
  skills?: [number, number, number];
  gear?: Partial<Record<GearSlot, GearRecord>>;
  cube?: CubeRecord;
  collection?: CollectionRecord;
  fetchedAt: string;
  source: string;
}

export interface OverloadTarget {
  effect: string;
  condition:
    | { type: "lines"; minimum: number; recommended?: number }
    | { type: "percent"; minimum: number }
    | { type: "present" }
    | { type: "absent" };
  priority: "required" | "optional";
}

export interface NikkeRecord {
  displayName?: string;
  owned: boolean;
  favorite: boolean;
  growthPriority?: GrowthPriority;
  level?: number;
  limitBreak?: number;
  combatPower?: number;
  skills?: [number, number, number];
  gear?: Partial<Record<GearSlot, GearRecord>>;
  cube?: CubeRecord;
  collection?: CollectionRecord;
  target?: {
    /** v3以前のバックアップ互換用。現在の画面では静的なキャラ別推奨値を優先する。 */
    skills?: [number, number, number];
    gearTier?: string;
    overloadCount?: number;
    cubeLevel?: number;
    /** 未設定なら同梱の推奨値、配列なら利用者が補正した目標を使う。 */
    overloadGoals?: OverloadTarget[];
  };
  notes?: string;
  manualUpdatedAt?: string;
  imported?: ImportedSnapshot;
}

export interface CoreDustState {
  currentLevel: number;
  targetLevel: number;
  currentDust: number;
  hourlyRate: number;
  cases: { h1: number; h2: number; h8: number; h12: number; h24: number };
}

export interface LocalProfile {
  id: string;
  name: string;
  records: Record<string, NikkeRecord>;
  coreDust: CoreDustState;
}

export interface AppData {
  version: 5;
  profile: LocalProfile;
  catalogMeta?: { fetchedAt: string; source: string; count: number };
  blablaMeta?: { fetchedAt: string; source: string; count: number };
}

export interface BlablaConnection {
  version: 1;
  openid: string;
  area?: number;
  autoSync: boolean;
  intervalHours: 168;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastCount?: number;
  lastError?: string;
}
