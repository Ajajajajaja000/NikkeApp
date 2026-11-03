export interface OverloadRecommendation {
  characterName: string;
  priorities: Array<{ effect: string; target: string; reason: string }>;
  cubes: string[];
  checked: string;
  sourceUrl: string;
  classification: "公開ビルド情報";
}

// 公開ビルド情報を確認できたキャラだけを収録する。不明なキャラへ類推で流用しない。
const recommendations: OverloadRecommendation[] = [
  {
    characterName: "マリアン：クイーン",
    priorities: [
      { effect: "有利コードダメージ増加", target: "4枠", reason: "有利属性での火力を優先" },
      { effect: "攻撃力増加", target: "4枠", reason: "汎用的な火力上昇" },
      { effect: "最大装弾数増加", target: "2枠", reason: "射撃継続時間を補助" },
      { effect: "クリティカルダメージ増加", target: "2枠", reason: "残り枠の候補" },
    ],
    cubes: ["レリックレジリエンスキューブ", "レリックベアーキューブ"],
    checked: "2026-11-03",
    sourceUrl: "https://nikkers.cc/nikke/marian-queen",
    classification: "公開ビルド情報",
  },
];

export function overloadRecommendation(name: string): OverloadRecommendation | undefined {
  return recommendations.find((item) => item.characterName === name);
}
