export type CommunityPurpose = "campaign" | "kraken" | "mirror" | "indivilla" | "ultra" | "harvester";

export const communityPurposes: Array<{ id: CommunityPurpose; label: string }> = [
  { id: "campaign", label: "キャンペーン" }, { id: "kraken", label: "異常個体：クラーケン" },
  { id: "mirror", label: "異常個体：ミラーコンテナ" }, { id: "indivilla", label: "異常個体：インディビリア" },
  { id: "ultra", label: "異常個体：ウルトラ" }, { id: "harvester", label: "異常個体：ハーベスター" },
];

export interface CommunityTeamMember { resourceId: number; name: string; treasure?: boolean }
export interface CommunityTeam {
  id: string; purpose: CommunityPurpose; title: string; members: CommunityTeamMember[];
  playStyle: "フルオート候補" | "手動推奨"; orderNote: string; summary: string;
  notes: string[]; substitutions: string[];
  source: { title: string; url: string; updated: string; checked: string };
}

const checked = "2026-11-03";
const prydwenSource = { title: "Prydwen — Story Meta Teams", url: "https://www.prydwen.gg/nikke/guides/meta-teams", updated: "2026-11-02", checked };
const gameWithSource = { title: "GameWith — 最強パーティー編成まとめ", url: "https://gamewith.jp/nikke/article/show/376374", updated: "2026-11-03", checked };
const anomalySource = (title: string, path: string) => ({ title: `NIKKE.GG — ${title}`, url: `https://nikke.gg/${path}/`, updated: "2026-10-12", checked });

// 公開攻略に掲載された完成編成だけを収録し、アプリ側で別編成へ組み替えない。
export const communityTeams: CommunityTeam[] = [
  {
    id: "gamewith-all-round", purpose: "campaign", title: "最新オールラウンド編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 223, name: "ナユタ" }, { resourceId: 19, name: "マリアン：クイーン" }, { resourceId: 471, name: "スノーホワイト：ヘビーアームズ" }, { resourceId: 330, name: "クラウン" }],
    playStyle: "フルオート候補", orderNote: "GameWithの掲載順です。", summary: "高火力と回復のバランスを取った、2026年11月3日更新の汎用完成編成です。",
    notes: ["掲載元はキャンペーン専用・フルオート保証とはしていないため、ステージに応じて手動操作してください。", "マリアン：クイーンまで反映された最新の掲載例です。"], substitutions: [], source: gameWithSource,
  },
  {
    id: "gamewith-pilgrim-os", purpose: "campaign", title: "最新ピルグリム＆オーバースペック編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 223, name: "ナユタ" }, { resourceId: 19, name: "マリアン：クイーン" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 330, name: "クラウン" }],
    playStyle: "フルオート候補", orderNote: "GameWithの掲載順です。", summary: "クラウンの防御・火力支援と強力なアタッカーを組み合わせた、2026年11月3日更新の完成編成です。",
    notes: ["掲載元はキャンペーン専用・フルオート保証とはしていないため、ステージに応じて手動操作してください。", "雑魚処理と最終ボスの両方を意識した掲載例です。"], substitutions: [], source: gameWithSource,
  },
  {
    id: "prydwen-story-team-38", purpose: "campaign", title: "高戦力差：宝ものヘルム編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 352, name: "ヘルム", treasure: true }, { resourceId: 94, name: "ベスティー：タクティカル・アップ" }, { resourceId: 16, name: "ラピ：レッドフード" }],
    playStyle: "手動推奨", orderNote: "Prydwenの掲載順です。", summary: "戦力差45〜50%帯のGod Comp #1として掲載された、超高難度向け編成です。",
    notes: ["高水準の育成、オバロ、有利属性、手動操作を前提とします。", "ステージごとの敵配置とバーストタイミングを確認してください。"], substitutions: [], source: prydwenSource,
  },
  {
    id: "kraken-nayuta", purpose: "kraken", title: "ナユタ・リバーレリオ編成",
    members: [{ resourceId: 513, name: "リトルマーメイド" }, { resourceId: 223, name: "ナユタ" }, { resourceId: 262, name: "リバーレリオ" }, { resourceId: 225, name: "紅蓮：ブラックシャドウ" }, { resourceId: 330, name: "クラウン" }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "風圧の主力を集めたクラーケン向け掲載編成です。", notes: ["赤丸処理と被弾管理のため手動確認を前提にします。"], substitutions: [], source: anomalySource("Anomaly Interception: Kraken", "anomaly-interception-kraken"),
  },
  {
    id: "kraken-alice", purpose: "kraken", title: "アリス編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 225, name: "紅蓮：ブラックシャドウ" }, { resourceId: 191, name: "アリス" }, { resourceId: 513, name: "リトルマーメイド" }, { resourceId: 352, name: "ヘルム", treasure: true }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "紅蓮：ブラックシャドウとアリスを組み合わせた掲載編成です。", notes: ["アリスの速射と赤丸処理を含む手動操作を前提にします。"], substitutions: [], source: anomalySource("Anomaly Interception: Kraken", "anomaly-interception-kraken"),
  },
  {
    id: "kraken-asuka", purpose: "kraken", title: "アスカ：WILLE編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 225, name: "紅蓮：ブラックシャドウ" }, { resourceId: 835, name: "アスカ：WILLE" }, { resourceId: 513, name: "リトルマーメイド" }, { resourceId: 352, name: "ヘルム", treasure: true }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "アスカ：WILLEを採用したクラーケン向け掲載編成です。", notes: ["赤丸処理と被弾管理のため手動確認を前提にします。"], substitutions: [], source: anomalySource("Anomaly Interception: Kraken", "anomaly-interception-kraken"),
  },
  {
    id: "mirror-mast", purpose: "mirror", title: "マスト：ロマンチックメイド編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 330, name: "クラウン" }, { resourceId: 511, name: "シンデレラ" }, { resourceId: 352, name: "ヘルム", treasure: true }, { resourceId: 354, name: "マスト：ロマンチックメイド" }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "シンデレラを中心にした電撃寄りの掲載編成です。", notes: ["ガラスの靴と電撃限定の赤丸を手動で処理します。"], substitutions: [], source: anomalySource("Anomaly Interception: Mirror Container", "anomaly-interception-mirror-container"),
  },
  {
    id: "mirror-privaty", purpose: "mirror", title: "プリバティ（宝もの）編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 330, name: "クラウン" }, { resourceId: 511, name: "シンデレラ" }, { resourceId: 352, name: "ヘルム", treasure: true }, { resourceId: 170, name: "プリバティ", treasure: true }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "宝ものプリバティを採用したミラーコンテナ向け掲載編成です。", notes: ["ガラスの靴と電撃限定の赤丸を手動で処理します。"], substitutions: [], source: anomalySource("Anomaly Interception: Mirror Container", "anomaly-interception-mirror-container"),
  },
  {
    id: "indivilla-diesel", purpose: "indivilla", title: "ディーゼル：ウィンタースイーツ編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 75, name: "ディーゼル：ウィンタースイーツ" }, { resourceId: 354, name: "マスト：ロマンチックメイド" }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "ラピ：レッドフードを主力にした掲載編成です。", notes: ["フェーズ移行時のレーザーにクラウンの無敵を合わせます。"], substitutions: [], source: anomalySource("Anomaly Interception: Indivilia", "anomaly-interception-indivilia"),
  },
  {
    id: "indivilla-mihara", purpose: "indivilla", title: "ミハラ：ボンディングチェーン編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 162, name: "ミハラ：ボンディングチェーン" }, { resourceId: 450, name: "ナガ" }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "ミハラ：ボンディングチェーンとナガを採用した掲載編成です。", notes: ["フェーズ移行時の攻撃とバーストタイミングを管理します。"], substitutions: [], source: anomalySource("Anomaly Interception: Indivilia", "anomaly-interception-indivilia"),
  },
  {
    id: "ultra-mast", purpose: "ultra", title: "マスト：ロマンチックメイド編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 470, name: "レッドフード" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 354, name: "マスト：ロマンチックメイド" }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "鉄甲アタッカー2人を使うウルトラ向け掲載編成です。", notes: ["ポイズンチャンバー、コア、属性赤丸を手動で処理します。"], substitutions: [], source: anomalySource("Anomaly Interception: Ultra", "anomaly-interception-ultra"),
  },
  {
    id: "ultra-privaty", purpose: "ultra", title: "プリバティ（宝もの）編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 470, name: "レッドフード" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 170, name: "プリバティ", treasure: true }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "宝ものプリバティを採用したウルトラ向け掲載編成です。", notes: ["ポイズンチャンバー、コア、属性赤丸を手動で処理します。"], substitutions: [], source: anomalySource("Anomaly Interception: Ultra", "anomaly-interception-ultra"),
  },
  {
    id: "harvester-privaty", purpose: "harvester", title: "プリバティ（宝もの）編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 471, name: "スノーホワイト：ヘビーアームズ" }, { resourceId: 352, name: "ヘルム", treasure: true }, { resourceId: 170, name: "プリバティ", treasure: true }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "水冷火力と宝もの支援を使う掲載編成です。", notes: ["部位、コア、属性赤丸を手動で処理します。"], substitutions: [], source: anomalySource("Anomaly Interception: Harvester", "anomaly-interception-harvester"),
  },
  {
    id: "harvester-mast", purpose: "harvester", title: "マスト：ロマンチックメイド編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 471, name: "スノーホワイト：ヘビーアームズ" }, { resourceId: 352, name: "ヘルム", treasure: true }, { resourceId: 354, name: "マスト：ロマンチックメイド" }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "マスト：ロマンチックメイドを採用した掲載編成です。", notes: ["部位、コア、属性赤丸を手動で処理します。"], substitutions: [], source: anomalySource("Anomaly Interception: Harvester", "anomaly-interception-harvester"),
  },
  {
    id: "harvester-ludmilla", purpose: "harvester", title: "ルドミラ：ウィンターオーナー編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 234, name: "ドロシー：セレンディピティ" }, { resourceId: 513, name: "リトルマーメイド" }, { resourceId: 194, name: "ルドミラ：ウィンターオーナー" }, { resourceId: 352, name: "ヘルム", treasure: true }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "ルドミラ：ウィンターオーナーを採用した掲載編成です。", notes: ["部位、コア、属性赤丸を手動で処理します。"], substitutions: [], source: anomalySource("Anomaly Interception: Harvester", "anomaly-interception-harvester"),
  },
];
