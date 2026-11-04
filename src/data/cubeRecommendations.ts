export interface CubeRecommendation {
  resourceId: number;
  cubes: string[];
  checked: string;
}

// キューブはオバロ効果とは別の育成要素として管理する。
const recommendations: CubeRecommendation[] = [
  { resourceId: 17, cubes: ["レリックレジリエンスキューブ", "最大装弾数4枠時はレリックベアーキューブも候補"], checked: "2026-11-04" },
  { resourceId: 19, cubes: ["レリックレジリエンスキューブ", "レリックベアーキューブ"], checked: "2026-11-04" },
  { resourceId: 322, cubes: ["レリックレジリエンスキューブ", "レリックベアーキューブ"], checked: "2026-11-04" },
];

export function cubeRecommendation(resourceId: number | undefined) {
  return recommendations.find((item) => item.resourceId === resourceId);
}
