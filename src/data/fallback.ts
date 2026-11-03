import type { BurstStage, CharacterSummary } from "../types";

const c = (id: number, resourceId: number, name: string, bursts: BurstStage[], element: string, cls: string, weapon: string): CharacterSummary => ({
  id: String(id), resourceId, name, bursts, element, class: cls, weapon, rarity: "SSR", corporation: "不明", source: "fallback",
});

// API停止・初回オフラインでも保存済みデータと主要キャラを識別できる最小カタログ。
// 通常時はAPIの206体一覧で置き換わる。画像や詳細は同梱しない。
export const fallbackCharacters: CharacterSummary[] = [
  c(447001, 470, "レッドフード", ["I", "II", "III"], "Iron", "Attacker", "SR"),
  c(201601, 16, "ラピ：レッドフード", ["III"], "Fire", "Attacker", "MG"),
  c(108201, 82, "リター", ["I"], "Iron", "Supporter", "SMG"),
  c(401901, 19, "マリアン：クイーン", ["III"], "Fire", "Attacker", "MG"),
];
