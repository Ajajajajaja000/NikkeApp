export type CommunityPurpose = "campaign" | "tribe" | "kraken" | "mirror" | "indivilla" | "ultra" | "harvester";

export const communityPurposes: Array<{ id: CommunityPurpose; label: string }> = [
  { id: "campaign", label: "キャンペーン" }, { id: "tribe", label: "トライブタワー" },
  { id: "kraken", label: "異常個体：クラーケン" },
  { id: "mirror", label: "異常個体：ミラーコンテナ" }, { id: "indivilla", label: "異常個体：インディビリア" },
  { id: "ultra", label: "異常個体：ウルトラ" }, { id: "harvester", label: "異常個体：ハーベスター" },
];

export interface CommunityTeamMember { resourceId: number; name: string; treasure?: boolean }
export interface CommunityTeam {
  id: string; purpose: CommunityPurpose; title: string; members: CommunityTeamMember[];
  playStyle: "フルオート候補" | "手動推奨"; orderNote: string; summary: string;
  notes: string[]; substitutions: string[]; verification: string;
  source: { title: string; url: string; updated: string; checked: string };
}

const checked = "2026-11-03";
const prydwenSource = { title: "Prydwen — Story Meta Teams", url: "https://www.prydwen.gg/nikke/guides/meta-teams", updated: "2026-11-02", checked };
const gameWithSource = { title: "GameWith — 最強パーティー編成まとめ", url: "https://gamewith.jp/nikke/article/show/376374", updated: "2026-11-03", checked };
const tribeTowerSource = { title: "GameWith — トライブタワー企業別おすすめ編成", url: "https://gamewith.jp/nikke/article/show/370073", updated: "2026-10-27", checked };
const anomalySource = (title: string, path: string) => ({ title: `NIKKE.GG — ${title}`, url: `https://nikke.gg/${path}/`, updated: "2026-10-12", checked });
const gameWithBossSource = (title: string, article: string, updated: string) => ({ title: `GameWith — ${title}`, url: `https://gamewith.jp/nikke/article/show/${article}`, updated, checked });

// 公開攻略に掲載された完成編成だけを収録し、アプリ側で別編成へ組み替えない。
export const communityTeams: CommunityTeam[] = [
  {
    id: "gamewith-all-round", purpose: "campaign", title: "最新オールラウンド編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 223, name: "ナユタ" }, { resourceId: 19, name: "マリアン：クイーン" }, { resourceId: 471, name: "スノーホワイト：ヘビーアームズ" }, { resourceId: 330, name: "クラウン" }],
    playStyle: "フルオート候補", orderNote: "GameWithの掲載順です。", summary: "高火力と回復のバランスを取った、2026年11月3日更新の汎用完成編成です。",
    notes: ["掲載元はキャンペーン専用・フルオート保証とはしていないため、ステージに応じて手動操作してください。", "マリアン：クイーンまで反映された最新の掲載例です。"], substitutions: [], verification: "GameWithの完成形を採用。PrydwenとNIKKE.GGの最新評価でも主要メンバーの役割を確認。", source: gameWithSource,
  },
  {
    id: "gamewith-pilgrim-os", purpose: "campaign", title: "最新ピルグリム＆オーバースペック編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 223, name: "ナユタ" }, { resourceId: 19, name: "マリアン：クイーン" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 330, name: "クラウン" }],
    playStyle: "フルオート候補", orderNote: "GameWithの掲載順です。", summary: "クラウンの防御・火力支援と強力なアタッカーを組み合わせた、2026年11月3日更新の完成編成です。",
    notes: ["掲載元はキャンペーン専用・フルオート保証とはしていないため、ステージに応じて手動操作してください。", "雑魚処理と最終ボスの両方を意識した掲載例です。"], substitutions: [], verification: "GameWithの完成形を採用。PrydwenとNIKKE.GGの最新評価でも主要メンバーの役割を確認。", source: gameWithSource,
  },
  {
    id: "prydwen-story-team-38", purpose: "campaign", title: "高戦力差：宝ものヘルム編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 352, name: "ヘルム", treasure: true }, { resourceId: 94, name: "ベスティー：タクティカル・アップ" }, { resourceId: 16, name: "ラピ：レッドフード" }],
    playStyle: "手動推奨", orderNote: "Prydwenの掲載順です。", summary: "戦力差45〜50%帯のGod Comp #1として掲載された、超高難度向け編成です。",
    notes: ["高水準の育成、オバロ、有利属性、手動操作を前提とします。", "ステージごとの敵配置とバーストタイミングを確認してください。"], substitutions: [], verification: "Prydwenの完成形を採用。GameWithの最新灼熱編成と主要4枠が一致。", source: prydwenSource,
  },
  {
    id: "tribe-elysion", purpose: "tribe", title: "エリシオンタワー編成",
    members: [{ resourceId: 43, name: "D：キラーワイフ" }, { resourceId: 354, name: "マスト：ロマンチックメイド" }, { resourceId: 355, name: "アンカー：イノセントメイド" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 352, name: "ヘルム" }],
    playStyle: "フルオート候補", orderNote: "GameWithの掲載順です。", summary: "火力支援と回復を両立し、ラピ：レッドフードを主力にするエリシオン限定編成です。",
    notes: ["エリシオン所属と、エリシオンに対応するオーバースペックだけで編成します。", "高戦力差やボス階ではヘルムの宝もの解放、手動操作、弱点属性への入れ替えを検討してください。"], substitutions: [], verification: "GameWithの完成形を採用。Prydwenの2026年11月更新例でもラピ：レッドフード、メイド支援、ヘルムを中核として確認。Loot & Waifusでも同じ役割構成を確認。", source: tribeTowerSource,
  },
  {
    id: "tribe-missilis", purpose: "tribe", title: "ミシリスタワー編成",
    members: [{ resourceId: 451, name: "ティア" }, { resourceId: 82, name: "リター" }, { resourceId: 450, name: "ナガ" }, { resourceId: 18, name: "ネオン：ビジョン・アイ" }, { resourceId: 162, name: "ミハラ：ボンディングチェーン" }],
    playStyle: "手動推奨", orderNote: "GameWithの掲載順です。", summary: "ティアとナガの回復・遮蔽物支援に、オーバースペック火力を組み合わせるミシリス限定編成です。",
    notes: ["ミシリス所属と、ミシリスに対応するオーバースペックだけで編成します。", "Prydwenは雑魚戦でラプラス：アルティメットヒーローと宝ものフローラを使う別の最新形も掲載しています。ステージ構成で使い分けてください。"], substitutions: [], verification: "GameWithの完成形を採用。Prydwenでもリターとナガを中核として確認。Loot & Waifusの2026年7月例ではリター、ナガ、ネオン：ビジョン・アイ、ミハラ：ボンディングチェーンの4人が一致。", source: tribeTowerSource,
  },
  {
    id: "tribe-tetra", purpose: "tribe", title: "テトラタワー編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 600, name: "ミント" }, { resourceId: 601, name: "プリカ" }, { resourceId: 191, name: "アリス" }, { resourceId: 570, name: "アークレンジャー・ブラック" }],
    playStyle: "フルオート候補", orderNote: "GameWithの掲載順です。", summary: "ミントとプリカのセット支援で、アリスとアークレンジャー・ブラックの火力を伸ばすテトラ限定編成です。",
    notes: ["テトラ所属と、テトラに対応するオーバースペックだけで編成します。", "風圧弱点の属性バリア階では、掲載元が示すブラン＋ノワールなどへの変更を検討してください。"], substitutions: [], verification: "GameWithの完成形を採用。Prydwenの2026年11月更新例でもアニス：スター、ミント、プリカ、アークレンジャー・ブラックを中核として確認。Loot & Waifusでもアニス：スターとアリスの採用を確認。", source: tribeTowerSource,
  },
  {
    id: "tribe-pilgrim", purpose: "tribe", title: "ピルグリム＆オーバースペックタワー編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 330, name: "クラウン" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 471, name: "スノーホワイト：ヘビーアームズ" }, { resourceId: 162, name: "ミハラ：ボンディングチェーン" }],
    playStyle: "フルオート候補", orderNote: "GameWithの掲載順です。", summary: "アニス：スターとクラウンの支援で3人のアタッカーを強化する、ピルグリム／オーバースペック限定編成です。",
    notes: ["ピルグリムとオーバースペックだけで編成します。", "属性バリアやボスに応じて、掲載元のリトルマーメイド、ナユタ、ネオン：ビジョン・アイ、リバーレリオなどの代用候補を確認してください。"], substitutions: [], verification: "GameWithの完成形を採用。Prydwenでもアニス：スターとラピ：レッドフードを軸にした全属性対応方針を確認。Loot & Waifusではアニス：スター、クラウン、ラピ：レッドフード、スノーホワイト：ヘビーアームズの4人が一致し、ミハラを灼熱枠に掲載。", source: tribeTowerSource,
  },
  {
    id: "kraken-nayuta", purpose: "kraken", title: "ナユタ・リバーレリオ編成",
    members: [{ resourceId: 513, name: "リトルマーメイド" }, { resourceId: 223, name: "ナユタ" }, { resourceId: 262, name: "リバーレリオ" }, { resourceId: 225, name: "紅蓮：ブラックシャドウ" }, { resourceId: 330, name: "クラウン" }],
    playStyle: "手動推奨", orderNote: "GameWithの掲載順です。", summary: "風圧の主力を集めたクラーケン向け掲載編成です。", notes: ["赤丸処理と被弾管理のため手動確認を前提にします。"], substitutions: [], verification: "GameWithとNIKKE.GGで同じ5人を確認。Prydwenでも同じ中核を最上位候補として掲載。", source: gameWithBossSource("クラーケン攻略", "461435", "2026-10-21"),
  },
  {
    id: "kraken-alice", purpose: "kraken", title: "アリス編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 225, name: "紅蓮：ブラックシャドウ" }, { resourceId: 191, name: "アリス" }, { resourceId: 513, name: "リトルマーメイド" }, { resourceId: 352, name: "ヘルム", treasure: true }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "紅蓮：ブラックシャドウとアリスを組み合わせた掲載編成です。", notes: ["アリスの速射と赤丸処理を含む手動操作を前提にします。"], substitutions: [], verification: "NIKKE.GGの完成形を採用。Prydwenでも紅蓮：ブラックシャドウ、アリス、クラウンを有力候補として確認。", source: anomalySource("Anomaly Interception: Kraken", "anomaly-interception-kraken"),
  },
  {
    id: "kraken-asuka", purpose: "kraken", title: "アスカ：WILLE編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 225, name: "紅蓮：ブラックシャドウ" }, { resourceId: 835, name: "アスカ：WILLE" }, { resourceId: 513, name: "リトルマーメイド" }, { resourceId: 352, name: "ヘルム", treasure: true }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "アスカ：WILLEを採用したクラーケン向け掲載編成です。", notes: ["赤丸処理と被弾管理のため手動確認を前提にします。"], substitutions: [], verification: "NIKKE.GGの完成形を採用。Prydwenでもアスカ：WILLEを有力な風圧アタッカーとして確認。", source: anomalySource("Anomaly Interception: Kraken", "anomaly-interception-kraken"),
  },
  {
    id: "mirror-electric", purpose: "mirror", title: "電撃特化型火力編成",
    members: [{ resourceId: 511, name: "シンデレラ" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 15, name: "アニス：スパークリングサマー" }, { resourceId: 330, name: "クラウン" }, { resourceId: 183, name: "メイデン：アイスローズ" }],
    playStyle: "手動推奨", orderNote: "GameWithの掲載順です。", summary: "有利属性の電撃アタッカーと電撃支援を集めた最新掲載編成です。", notes: ["ガラスの靴と電撃限定の赤丸を手動で処理します。", "限定キャラを含むため、未所持の場合は掲載元の代用候補を確認してください。"], substitutions: [], verification: "GameWithの完成形を採用。Prydwenの最新チーム例でも同じ5人を中核候補として確認。", source: gameWithBossSource("ミラーコンテナ攻略", "458118", "2026-10-26"),
  },
  {
    id: "mirror-gimmick", purpose: "mirror", title: "ガラスの靴対策編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 330, name: "クラウン" }, { resourceId: 18, name: "ネオン：ビジョン・アイ" }, { resourceId: 840, name: "エイダ" }, { resourceId: 354, name: "マスト：ロマンチックメイド" }],
    playStyle: "手動推奨", orderNote: "GameWithの掲載順です。", summary: "一撃火力を重視し、ガラスの靴の破壊を狙う最新掲載編成です。", notes: ["ガラスの靴が露出する直前にアタッカー以外をハイドさせます。", "エイダはコラボ限定キャラです。"], substitutions: [], verification: "GameWithの完成形を採用。Prydwenでも同じ中核4人とマストの運用を確認。", source: gameWithBossSource("ミラーコンテナ攻略", "458118", "2026-10-26"),
  },
  {
    id: "indivilla-balanced", purpose: "indivilla", title: "耐久・火力バランス編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 330, name: "クラウン" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 352, name: "ヘルム" }, { resourceId: 354, name: "マスト：ロマンチックメイド" }],
    playStyle: "手動推奨", orderNote: "GameWithの掲載順です。", summary: "クラウンのバリアとヘルムの回復を備えた、灼熱主力の最新掲載編成です。", notes: ["3回に1回マストのバーストを使う運用が紹介されています。", "フェーズ移行時の攻撃に合わせて防御を管理します。"], substitutions: [], verification: "GameWithの完成形を採用。NIKKE.GGの主要編成と中核4人が一致。", source: gameWithBossSource("インディビリア攻略", "461602", "2026-10-27"),
  },
  {
    id: "indivilla-mihara", purpose: "indivilla", title: "ミハラ：ボンディングチェーン編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 162, name: "ミハラ：ボンディングチェーン" }, { resourceId: 450, name: "ナガ" }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "ミハラ：ボンディングチェーンとナガを採用した掲載編成です。", notes: ["フェーズ移行時の攻撃とバーストタイミングを管理します。"], substitutions: [], verification: "NIKKE.GGの完成形を採用。GameWithでもミハラをラピ枠の代用候補として確認。", source: anomalySource("Anomaly Interception: Indivilia", "anomaly-interception-indivilia"),
  },
  {
    id: "ultra-mast", purpose: "ultra", title: "マスト：ロマンチックメイド編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 330, name: "クラウン" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 470, name: "レッドフード" }, { resourceId: 354, name: "マスト：ロマンチックメイド" }],
    playStyle: "手動推奨", orderNote: "GameWithの掲載順です。", summary: "クラウンのバリアで攻撃を受けつつ、火力も確保する安定型掲載編成です。", notes: ["ポイズンチャンバー、コア、属性赤丸を手動で処理します。"], substitutions: [], verification: "GameWithとNIKKE.GGで同じ5人を確認。", source: gameWithBossSource("ウルトラ攻略", "424570", "2026-10-14"),
  },
  {
    id: "ultra-privaty", purpose: "ultra", title: "プリバティ（宝もの）編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 470, name: "レッドフード" }, { resourceId: 16, name: "ラピ：レッドフード" }, { resourceId: 170, name: "プリバティ", treasure: true }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "宝ものプリバティを採用したウルトラ向け掲載編成です。", notes: ["ポイズンチャンバー、コア、属性赤丸を手動で処理します。"], substitutions: [], verification: "NIKKE.GGの完成形を採用。GameWithでもプリバティを同枠の代用候補として確認。", source: anomalySource("Anomaly Interception: Ultra", "anomaly-interception-ultra"),
  },
  {
    id: "harvester-balanced", purpose: "harvester", title: "耐久・火力バランス編成",
    members: [{ resourceId: 17, name: "アニス：スター" }, { resourceId: 330, name: "クラウン" }, { resourceId: 471, name: "スノーホワイト：ヘビーアームズ" }, { resourceId: 234, name: "ドロシー：セレンディピティ" }, { resourceId: 352, name: "ヘルム", treasure: true }],
    playStyle: "手動推奨", orderNote: "GameWithの掲載順です。", summary: "水冷火力、部位破壊、回復を揃えた最新掲載編成です。", notes: ["部位、コア、属性赤丸を手動で処理します。", "ヘルムは宝もの解放を前提とする掲載例です。"], substitutions: [], verification: "GameWithの完成形を採用。NIKKE.GGとPrydwenでも主要メンバーの役割を確認。", source: gameWithBossSource("ハーベスター攻略", "461776", "2026-10-14"),
  },
  {
    id: "harvester-mast", purpose: "harvester", title: "マスト：ロマンチックメイド編成",
    members: [{ resourceId: 330, name: "クラウン" }, { resourceId: 17, name: "アニス：スター" }, { resourceId: 471, name: "スノーホワイト：ヘビーアームズ" }, { resourceId: 352, name: "ヘルム", treasure: true }, { resourceId: 354, name: "マスト：ロマンチックメイド" }],
    playStyle: "手動推奨", orderNote: "NIKKE.GGの掲載順です。", summary: "マスト：ロマンチックメイドを採用した掲載編成です。", notes: ["部位、コア、属性赤丸を手動で処理します。"], substitutions: [], verification: "NIKKE.GGの完成形を採用。GameWithでもアニス：スター、クラウン、スノーホワイト：ヘビーアームズ、ヘルムを中核として確認し、マストは代用候補に掲載。", source: anomalySource("Anomaly Interception: Harvester", "anomaly-interception-harvester"),
  },
];
