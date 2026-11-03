export type CommunityPurpose = "campaign" | "kraken" | "mirror" | "indivilla" | "ultra" | "harvester";

export const communityPurposes: Array<{ id: CommunityPurpose; label: string }> = [
  { id: "campaign", label: "キャンペーン" },
  { id: "kraken", label: "異常個体：クラーケン" },
  { id: "mirror", label: "異常個体：ミラーコンテナ" },
  { id: "indivilla", label: "異常個体：インディビリア" },
  { id: "ultra", label: "異常個体：ウルトラ" },
  { id: "harvester", label: "異常個体：ハーベスター" },
];

export interface CommunityTeamMember {
  resourceId: number;
  name: string;
  treasure?: boolean;
}

export interface CommunityTeam {
  id: string;
  purpose: CommunityPurpose;
  title: string;
  members: CommunityTeamMember[];
  playStyle: "フルオート候補" | "手動推奨";
  orderNote: string;
  summary: string;
  notes: string[];
  substitutions: string[];
  source: { title: string; url: string; checked: string };
}

const checked = "2026-11-03";

// 公開攻略に掲載された完成編成だけを収録する。アプリ側でメンバーを合成しない。
export const communityTeams: CommunityTeam[] = [
  {
    id: "prydwen-campaign-rapi",
    purpose: "campaign",
    title: "ラピ：レッドフード軸 キャンペーン編成",
    members: [
      { resourceId: 330, name: "クラウン" },
      { resourceId: 513, name: "リトルマーメイド" },
      { resourceId: 16, name: "ラピ：レッドフード" },
      { resourceId: 352, name: "ヘルム", treasure: true },
      { resourceId: 260, name: "モダニア" },
    ],
    playStyle: "フルオート候補",
    orderNote: "Prydwen掲載順。厳密な配置指定ではありません。",
    summary: "ラピ：レッドフードを主軸に、単体・範囲火力とヘルムの回復を両立するキャンペーン編成です。",
    notes: ["モダニアの育成が不足する場合は、掲載元ではナガへの変更例があります。", "状況に応じてモダニアまたはヘルムのバーストを使い分ける説明があるため、完全放置を保証する編成ではありません。"],
    substitutions: ["モダニア → ナガ（ラピ：レッドフードが十分に育成済みの場合）", "リトルマーメイド → 他のB1・CT短縮役（ヘルムでゲージ生成を補える場合）"],
    source: { title: "Prydwen — Teams Database", url: "https://www.prydwen.gg/nikke/teams-database", checked },
  },
  {
    id: "nikke-gg-kraken-best",
    purpose: "kraken",
    title: "NIKKE.GG Best Team",
    members: [
      { resourceId: 513, name: "リトルマーメイド" },
      { resourceId: 223, name: "ナユタ" },
      { resourceId: 262, name: "リバーレリオ" },
      { resourceId: 225, name: "紅蓮：ブラックシャドウ" },
      { resourceId: 330, name: "クラウン" },
    ],
    playStyle: "手動推奨",
    orderNote: "NIKKE.GGのBest Teams掲載順。配置順の指定は確認できていません。",
    summary: "風圧の主力を集めたクラーケン向け掲載編成です。",
    notes: ["赤丸処理や被弾管理があるため、手動確認を前提にします。", "掲載元の攻略動画・ボス機構を確認して運用してください。"],
    substitutions: [],
    source: { title: "NIKKE.GG — Anomaly Interception: Kraken", url: "https://nikke.gg/anomaly-interception-kraken/", checked },
  },
  {
    id: "nikke-gg-mirror-best",
    purpose: "mirror",
    title: "NIKKE.GG Best Team",
    members: [
      { resourceId: 17, name: "アニス：スター" },
      { resourceId: 330, name: "クラウン" },
      { resourceId: 511, name: "シンデレラ" },
      { resourceId: 352, name: "ヘルム", treasure: true },
      { resourceId: 354, name: "マスト：ロマンチックメイド" },
    ],
    playStyle: "手動推奨",
    orderNote: "NIKKE.GGのBest Teams掲載順。配置順の指定は確認できていません。",
    summary: "シンデレラを中心にした電撃寄りのミラーコンテナ向け掲載編成です。",
    notes: ["ガラスの靴は一撃制限があるため、SR/RLのチャージ射撃やポーズ操作を使う説明があります。", "電撃限定の赤丸処理に失敗すると壊滅するため、フルオート対象にはしません。"],
    substitutions: [],
    source: { title: "NIKKE.GG — Anomaly Interception: Mirror Container", url: "https://nikke.gg/anomaly-interception-mirror-container/", checked },
  },
  {
    id: "nikke-gg-indivilla-best",
    purpose: "indivilla",
    title: "Crown + Anis: Star Team",
    members: [
      { resourceId: 330, name: "クラウン" },
      { resourceId: 16, name: "ラピ：レッドフード" },
      { resourceId: 17, name: "アニス：スター" },
      { resourceId: 75, name: "ディーゼル：ウィンタースイーツ" },
      { resourceId: 354, name: "マスト：ロマンチックメイド" },
    ],
    playStyle: "手動推奨",
    orderNote: "NIKKE.GG掲載順。配置順の指定は確認できていません。",
    summary: "ラピ：レッドフードを主力に、アニス：スターのCT短縮とゲージ支援を使う掲載編成です。",
    notes: ["フェーズ2移行時のレーザーに合わせ、クラウンの無敵タイミングを管理する注意があります。", "ディーゼルの速射でバーストゲージを補う運用が紹介されています。"],
    substitutions: ["マスト：ロマンチックメイド → フローラ（宝もの）（操作を簡単にしたい場合）"],
    source: { title: "NIKKE.GG — Anomaly Interception: Indivilia", url: "https://nikke.gg/anomaly-interception-indivilia/", checked },
  },
  {
    id: "nikke-gg-ultra-best",
    purpose: "ultra",
    title: "NIKKE.GG Best Team",
    members: [
      { resourceId: 330, name: "クラウン" },
      { resourceId: 17, name: "アニス：スター" },
      { resourceId: 470, name: "レッドフード" },
      { resourceId: 16, name: "ラピ：レッドフード" },
      { resourceId: 354, name: "マスト：ロマンチックメイド" },
    ],
    playStyle: "手動推奨",
    orderNote: "NIKKE.GGのBest Teams掲載順。配置順の指定は確認できていません。",
    summary: "鉄甲アタッカー2人とクラウンの防御支援を使うウルトラ向け掲載編成です。",
    notes: ["ポイズンチャンバー、コア、属性赤丸を確実に処理する必要があります。", "全体攻撃をシールドで受ける操作が推奨されるため、フルオート対象にはしません。"],
    substitutions: [],
    source: { title: "NIKKE.GG — Anomaly Interception: Ultra", url: "https://nikke.gg/anomaly-interception-ultra/", checked },
  },
  {
    id: "nikke-gg-harvester-best",
    purpose: "harvester",
    title: "NIKKE.GG Best Team",
    members: [
      { resourceId: 330, name: "クラウン" },
      { resourceId: 17, name: "アニス：スター" },
      { resourceId: 471, name: "スノーホワイト：ヘビーアームズ" },
      { resourceId: 352, name: "ヘルム", treasure: true },
      { resourceId: 170, name: "プリバティ", treasure: true },
    ],
    playStyle: "手動推奨",
    orderNote: "NIKKE.GGのBest Teams掲載順。配置順の指定は確認できていません。",
    summary: "水冷火力と宝もの支援を使うハーベスター向け掲載編成です。",
    notes: ["属性赤丸のため水冷ニケが必要とされるボスです。", "部位・コア・赤丸の処理があるため、フルオート対象にはしません。"],
    substitutions: [],
    source: { title: "NIKKE.GG — Anomaly Interception: Harvester", url: "https://nikke.gg/anomaly-interception-harvester/", checked },
  },
];
