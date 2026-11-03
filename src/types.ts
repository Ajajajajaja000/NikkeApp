export type BurstStage = "I" | "II" | "III";
export type GearSlot = "head" | "chest" | "arms" | "legs";

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

export interface NikkeRecord {
  displayName?: string;
  owned: boolean;
  favorite: boolean;
  level?: number;
  limitBreak?: number;
  combatPower?: number;
  skills?: [number, number, number];
  gear?: Partial<Record<GearSlot, GearRecord>>;
  cube?: CubeRecord;
  collection?: CollectionRecord;
  target?: {
    skills: [number, number, number];
    gearTier: string;
    overloadCount: number;
    cubeLevel: number;
  };
  notes?: string;
  manualUpdatedAt?: string;
  imported?: ImportedSnapshot;
}

export interface SavedTeam {
  id: string;
  name: string;
  purpose: string;
  characterIds: string[];
  createdAt: string;
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
  savedTeams: SavedTeam[];
  coreDust: CoreDustState;
}

export interface AppData {
  version: 3;
  profile: LocalProfile;
  catalogMeta?: { fetchedAt: string; source: string; count: number };
  blablaMeta?: { fetchedAt: string; source: string; count: number };
}

export interface BlablaConnection {
  version: 1;
  openid: string;
  area?: number;
  autoSync: boolean;
  intervalHours: 72;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastCount?: number;
  lastError?: string;
}

export interface TeamSuggestion {
  title: string;
  characterIds: string[];
  mode: "フルオート向け" | "手動推奨" | "編成不足";
  score: number;
  reasons: string[];
  cautions: string[];
  alternatives: string[];
}
