export const sources = [
  {
    title: "非公式 NIKKE API / GitHub",
    url: "https://github.com/leegunwoooo/nikke-api",
    checked: "2026-11-03",
    note: "非公式・非商用ファンプロジェクト。認証不要、4言語対応。実測でCORS許可、206体、マリアン：クイーン収録を確認。ゲーム素材の権利は SHIFT UP / Level Infinite に帰属。",
  },
  {
    title: "非公式 NIKKE API / API.md",
    url: "https://github.com/leegunwoooo/nikke-api/blob/main/API.md",
    checked: "2026-11-03",
    note: "一覧・詳細・装備・キューブ・BlablaLink共有プロフィールのJSON仕様。ユーザー系は no-store。",
  },
  {
    title: "Loot & Waifus API",
    url: "https://lootandwaifus.com/api/",
    checked: "2026-11-03",
    note: "認証不要の静的JSON。CORS許可を実測。英語中心で、評価や推奨ビルドは含まれないため本アプリの通常取得には未使用。",
  },
  {
    title: "Nikkers — キャラ別ビルド",
    url: "https://nikkers.cc/api",
    checked: "2026-11-03",
    note: "公開APIのキャラ別notesをresourceIdで照合し、60体分のオバロ推奨を静的収録。実行時APIとしては使わず、未確認キャラへ推測で流用しない。CORSに依存しない代わりに、サイト側の更新後はアプリ更新が必要。",
  },
  {
    title: "Prydwen — Builds / Overload Gear",
    url: "https://www.prydwen.gg/nikke/builds",
    checked: "2026-11-03",
    note: "キャラ別ビルドの手動相互確認候補。公開APIと再配布許諾は未確認で、自動取得はCloudflareのHTTP 403となるため、実行時取得や回避は行わない。",
  },
  {
    title: "NIKKE.GG — Overload Gear Priority",
    url: "https://nikke.gg/overload-gear-priority/",
    checked: "2026-11-03",
    note: "推奨効果・本数・注意点の手動相互確認候補。公開ページは確認できたが、推奨データの再利用を許可するAPI・ライセンスは未確認のため一括取得しない。",
  },
  {
    title: "GameWith — キャラ別おすすめオバロ",
    url: "https://gamewith.jp/nikke/article/show/426750",
    checked: "2026-11-03",
    note: "日本語の手動相互確認候補。トーブの装弾数・攻撃力・有利コードの理由を確認し、該当キャラの補助出典として表示。掲載順を厳密な優先順位とは扱わない。",
  },
  {
    title: "ニケハブ — オーバーロードシミュレーター",
    url: "https://nikkehub.com/ja/tools/overload",
    checked: "2026-11-03",
    note: "目的が近い既存ツールとして案内。公開API・データ再利用条件は未確認のため、本アプリの実行時取得元には使用しない。",
  },
  {
    title: "Prydwen — Anomaly Interception",
    url: "https://www.prydwen.gg/nikke/guides/game-modes-anomaly-interception",
    checked: "2026-11-03",
    note: "異常個体5ボスの属性、有利・不利属性と一般的注意点の確認に使用。編成提案自体は本アプリ独自ルール。",
  },
];
