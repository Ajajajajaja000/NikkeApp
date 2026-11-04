export type OverloadPriorityKind = "ideal" | "filler" | "avoid";

export interface OverloadPriority {
  effect: string;
  target: string;
  reason: string;
  kind: OverloadPriorityKind;
}

export interface OverloadRecommendation {
  resourceId: number;
  priorities: OverloadPriority[];
  checked: string;
  sources: Array<{ label: string; url: string }>;
  classification: "全キャラ表を主基準・複数ソース照合";
  investmentPriority: string;
  treasure?: boolean;
}

type RawRow = [resourceId: number, ideal: string, filler: string, priority: string, avoid?: string, treasure?: boolean];

const checked = "2026-11-04";
const sources = [
  { label: "Prydwen Character Builds", url: "https://www.prydwen.gg/nikke/builds" },
  { label: "NIKKE.GG Overload Gear Priority", url: "https://nikke.gg/overload-gear-priority/" },
  { label: "Game8 オーバーロード", url: "https://game8.jp/nikke/534126" },
  { label: "GameWith NIKKE攻略", url: "https://gamewith.jp/nikke/" },
  { label: "Nikkers API", url: "https://nikkers.cc/api" },
];

const effectLabels: Record<string, string> = {
  E: "有利コードダメージ増加",
  A: "攻撃力増加",
  M: "最大装弾数増加",
  CS: "チャージ速度増加",
  CR: "クリティカル確率増加",
  CD: "クリティカルダメージ増加",
  HR: "命中率増加",
  CHD: "チャージダメージ増加",
  DEF: "防御力増加",
};

const priorityLabels: Record<string, string> = {
  META: "メタ級", METAB: "メタ級（ボス）", VH: "非常に高い", H: "高い", MED: "中", MEDB: "中（ボス）", MEDP: "中（PvP）",
  MEDPM: "中（PvPメタ）", L: "低い", LB: "低い（ボス）", LP: "低い（PvP）", VL: "非常に低い", NONE: "厳選不要",
};

function parseToken(token: string, kind: OverloadPriorityKind): OverloadPriority | undefined {
  if (!token || token === "-") return undefined;
  const match = token.match(/^(?:(\d+)(?:-(\d+))?)?([A-Z]+)$/);
  if (!match) return undefined;
  const [, minimumText, recommendedText, code] = match;
  const effect = effectLabels[code];
  if (!effect) return undefined;
  if (kind === "avoid") return { effect, target: "付けない", kind, reason: "キャラ固有の発動条件と相性が悪い効果" };
  const minimum = minimumText ? Number(minimumText) : undefined;
  const recommended = recommendedText ? Number(recommendedText) : undefined;
  const target = minimum === undefined ? "候補"
    : minimum === 0 && recommended !== undefined ? `最大${recommended}枠候補`
      : recommended !== undefined ? `${minimum}〜${recommended}枠` : `${minimum}枠`;
  return { effect, target, kind, reason: kind === "ideal" ? "全キャラ推奨表の理想本数" : "理想効果をそろえた後の追加候補" };
}

function parseEffects(value: string, kind: OverloadPriorityKind) {
  return value.split("|").map((token) => parseToken(token, kind)).filter((item): item is OverloadPriority => Boolean(item));
}

// Prydwenの全キャラOverload Gear表（227行：通常206体＋宝もの21状態）を一括確認し、
// Game8・GameWith・NIKKE.GG・Nikkersで一般則と特殊条件を照合した静的スナップショット。
const rawRows: RawRow[] = [
  [18,"4E|4CS|2-3A|1-2M","","METAB"], [80,"4CS","4E|4A","LP"], [82,"","","MED"], [100,"4A|4E","4CS","VL"],
  [101,"4A|4E","","LB"], [102,"4E|4A|2-4CD","0-2M","MEDB"], [103,"4E|4M","A|CR|CD","H"], [104,"4E","CR|CD|CHD","MED"],
  [105,"4E|1M","0-2M|0-4CS|0-4A","MEDB"], [110,"","","NONE"], [111,"4CS|4E|4A","4DEF","LP"], [120,"","","NONE"],
  [121,"4CS","4A|4E|4DEF","LP"], [131,"4A|4E","4DEF","LP"], [150,"","","NONE"], [160,"","","NONE"], [161,"","","NONE"],
  [162,"4E|4A|3M","CR|CD|M","H"], [172,"","","NONE"], [192,"1-4M","","MEDB"], [290,"4E|4A","","MEDB"], [291,"","","NONE"],
  [302,"","","NONE"], [303,"","","NONE"], [307,"","","NONE"], [361,"4E|4CR|4CD","","NONE"], [391,"4E|4A|2-3M","M|CS|CR|CD","MED"],
  [400,"4E|4A|1-2M","","LB"], [401,"","","NONE"], [402,"","","NONE"], [403,"4E|4A|2-3M|1-2HR","1-2CD|1-2CR|1HR|1M","MEDB"],
  [404,"4E|4A|1-2M","CS|CR|CD|CHD","MEDB"], [405,"4E|4A|1-2M","CR|CD|CHD","MEDB"], [411,"4M|4E|4A","","NONE"],
  [412,"4CS|1-3M","E|A","L"], [450,"4A|4E|4M","4CR|4CD","L"], [451,"","","L"], [500,"2-3M|4E|4A","","VL"],
  [501,"4E|4A|2M","","NONE"], [502,"4E|4A|1M","M|CD|CR","MEDB"], [590,"","","NONE"], [620,"1-2M","","VL"],
  [10,"","","NONE"], [11,"","","NONE"], [14,"4E|4A|4M","","NONE"], [16,"4E|4A|4M","","META"], [20,"","","NONE"],
  [22,"","","NONE"], [30,"","","NONE"], [32,"","","LB"], [33,"4CS","4A|4E|4DEF","LP"], [40,"","","NONE"], [41,"4E|4A","4CD","NONE"],
  [43,"1-2M","","MED"], [70,"","","NONE"], [71,"4A|4E","","NONE"], [72,"3-4M","","NONE"], [73,"4E|4A|1-3M","4CR|4CD|1-3M","LB"],
  [74,"4E|4A|1-2M","4CD|4CR|1-2M","MED"], [75,"4E|4A","1-2M|4CR|4CD","H"], [90,"","","NONE"], [91,"4E|4A","4CS","NONE"],
  [92,"","","NONE"], [93,"4E|4A|4M","","MEDB"], [94,"4E|2M|2CS|4A","M|CD|CR","MED"], [95,"4E|4A|2M","CD|M|CR","MEDB"],
  [113,"4E|3M|4A","4HR|4CR|4CD","LB"], [170,"","","NONE"], [180,"4E|4A|4M","","NONE"], [181,"4A|4E","","VL"],
  [182,"4E|2M|4A","2HR|2M","MEDB"], [183,"4E|4A|1-2M","2-3CS","MED"], [280,"4A|4E","4CR","MEDPM"],
  [300,"","","NONE"], [301,"","","NONE"], [306,"","","NONE"], [313,"3-4M|4E|4A","2-3HR|2-3CR|2-3CD","LB"],
  [321,"4E|4A","","NONE"], [322,"4E|4A|4CD","","MEDB"], [350,"","","VL"], [351,"","","NONE"], [352,"1-2M","4E|4A","L"],
  [353,"","","VL"], [354,"4E|4A|1M","3HR|3M","MED"], [355,"4E|4A|1-2M","","MED"], [390,"","","NONE"], [441,"","","NONE"],
  [532,"","","NONE"], [580,"4E|4A|2-3M","2HR|1-2CD|1-2CR|2M","LB"], [581,"1-2M","4E|4A|2-4CS","MEDB"],
  [582,"4E|1-2M|4A","2-3CR|2-3CD","MEDPM"], [583,"4E|4A","4CD|4CR|4HR","MEDB","M"], [12,"4CS","4A|4E|4DEF","LP"],
  [15,"4E|4A","4CR|4CD|HR","MED","M"], [17,"4E|4A|1-3M","CR|CD|CHD","META"], [60,"","","NONE"], [61,"","","NONE"],
  [62,"","","LP"], [63,"1-2M","","MEDB"], [112,"0-4M|4A|4E","1-4HR","LB"], [130,"","","NONE"], [132,"1-2M","","NONE"],
  [140,"2-3M|4E|4A","","VL"], [141,"","","NONE"], [142,"","","NONE"], [143,"4M|4E|4A","","MEDB"], [171,"1-2M","","VL"],
  [190,"","","NONE"], [191,"2CS|3-4A|2-3M|4E","","MED"], [193,"4A|4E","","VL"], [194,"2M|4E|4A","2M|2CR|2CD","MEDB"],
  [195,"1-3M","","VL"], [200,"4E|4A|4M","","NONE"], [201,"","","NONE"], [202,"1-2M","","VL"], [203,"","","NONE"],
  [210,"","","NONE"], [212,"","","NONE"], [240,"4CS","4A|4E|4DEF","LP"], [241,"4A|4E","","VL"], [242,"","","NONE"],
  [270,"","","L"], [271,"4E|2-3M|4A","4CR|4CD","L"], [272,"1-2M","4E|4A","MED"], [281,"","","MEDPM"], [282,"1-2M","","NONE"],
  [283,"","","LB"], [284,"4E|4A","4CD","VL"], [304,"","","NONE"], [305,"","","NONE"], [308,"","","NONE"], [310,"4M","","NONE"],
  [311,"","","NONE"], [312,"","","LP"], [314,"1-2M|4E|4A","1-2HR|1-2CR|1-2CD","MEDB"], [315,"1-2M","4E|4A","MED"],
  [316,"4E|2-4A|0-2M|2-4CS","4CD|4CR","MEDB"], [380,"4A|4E","4DEF","LP"], [381,"4E|4A|2-4CS","0-2M","MEDPM"],
  [382,"1-3M|4E|4A","","LB"], [392,"","","NONE"], [430,"4CS","4A|4E","MEDPM"], [431,"","","VL"], [432,"","","NONE"],
  [520,"4E|4A|1M","1M|2-3CS|2-3CR|2-3CD","MEDB"], [521,"1-2M","","VL"], [550,"4CS","4A|4E|4DEF","LP"],
  [551,"","","VL"], [570,"4E|4CD|4A","","MEDB"], [600,"1-2M","","MEDB"], [601,"1-2M","","MED"],
  [19,"4E|4A|1-3M","CR|CD","META"], [220,"4E|4A|4CD","","MEDB"], [221,"4CS|2-4M|4E","4A","MEDPM"],
  [222,"4E|4A|4M","1-2HR|1-2CR|1-2CD","MED"], [223,"4E|4A","4CR|4CD|4CHD","VH"], [224,"4E|4A","","LB"],
  [225,"1M|1CS|4E|4A","3CS","META"], [226,"","","NONE"], [230,"4A|4CS|4E","","NONE"], [231,"4E|4A|4M","","MEDB"],
  [232,"4CS","4A|4E","MEDPM"], [233,"4A|4E","","VL","M"], [234,"4M|4E|4A","CR|CD","H"], [260,"4M|4A|4E","1HR|1-2CR","MEDB"],
  [261,"4CS","","LP"], [262,"4E|4A|1M","3CS|3CD","META"], [330,"2M|4E|4A","CR|CD|M","VH"], [331,"","","VL"],
  [470,"4E|1-2M|4A","2-3CS","VH"], [471,"4E|4A","1M|3-4CR|3-4CD","META","CS"], [472,"","","NONE"], [473,"","","NONE"],
  [511,"4E|4A|2M","1-3CR|1-3CD|1-2M","META"], [513,"4E|4A","4CR|4CD|4M","VH"], [514,"4E|4A|4CD","","MED","M"],
  [515,"4E|4A|3-4M","CD|CR","META","CS"], [23,"","4M|4E|4A","VL"], [800,"","","VL"], [801,"4A|4CS|4E","","NONE"],
  [802,"","","NONE"], [810,"4E|4CD","4CR|4A","LB"], [811,"4E|4A|4CS","1-2M","LP"], [812,"1-2M","","NONE"],
  [820,"4M|4E|4A","4CD","VL"], [821,"4CS|4A|4E","M","MEDPM"], [822,"","","NONE"], [830,"4E|4M|4A","","MED"],
  [831,"4A|4E|4M","","MEDB"], [832,"1-2M","","MEDB"], [833,"","","NONE"], [834,"4E|4A|2-4M","2CD|2CR","MEDB"],
  [835,"4E|4M|4A","","H"], [836,"","","NONE"], [840,"4E|1-2M|4A","4CD|4CS","MEDB"], [841,"4E|4A","","LP"],
  [842,"","","NONE"], [850,"4E|4A|4CD","1-2CR|1M","MEDB"], [851,"4E|4A","CR|CD|1M","H"], [852,"","","NONE"],
  [860,"4E|4A|2-3M","2HR|2CR|2CD","MEDB"], [861,"4E|4A|2M","2HR|2CR|2CD","MED"], [862,"","","NONE"],
  [870,"4E","A|CR|CD|M","MEDB"], [871,"4E|2-3M","A|CR|CD|M","MEDB"], [872,"","","NONE"],

  // 宝もの解放時は同じresourceIdの通常推奨よりこちらを優先する。
  [550,"4CS","4A|4E|4DEF","MEDPM","",true], [80,"4CS|2M","4E|2A","MEDPM","",true], [72,"2-3M","","VL","",true],
  [101,"1M|4E|4A","3M|3CR|3CD|3HR","MEDB","",true], [210,"4E|4A","4CS|CR|CD","MEDB","M",true],
  [411,"","4E|4A|2-4M","VH","",true], [142,"1-2M|4CS","","NONE","",true], [352,"4E|4A","4CR|4CD|4CS|1M","META","",true],
  [150,"4E|4A","1M|3CR","LB","",true], [100,"4E|4A|4CS","0-2M","MEDPM","",true], [141,"","1M|3-4CS","NONE","",true],
  [32,"4E|4A","","MEDB","",true], [281,"4E|4A","4CD|4CR|4DEF","MED","",true], [580,"4E|4A|1-2M","CR|CD|M","MEDB","",true],
  [30,"4A|4E","","LP","",true], [170,"4E|4A","4CR|4CD","META","",true], [280,"4E|2M","4E|2M|4CR|2A","MED","",true],
  [140,"4E|4A|1-2M","1-2M","H","",true], [192,"4E|4A|1M","M","MEDB","",true], [112,"0-4M|4A|4E","1-4HR","LB","",true],
  [390,"4E|4A","2HR|2CR|2CD","LB","",true],
];

const recommendations: OverloadRecommendation[] = rawRows.map(([resourceId, ideal, filler, priority, avoid = "", treasure]) => ({
  resourceId,
  priorities: [...parseEffects(ideal, "ideal"), ...parseEffects(filler, "filler"), ...parseEffects(avoid, "avoid")],
  checked,
  sources,
  classification: "全キャラ表を主基準・複数ソース照合",
  investmentPriority: priorityLabels[priority] ?? priority,
  ...(treasure ? { treasure: true } : {}),
}));

const fallbackNameIds: Record<string, number> = { "マリアン：クイーン": 19, "ラピ：レッドフード": 16, "レッドフード": 470 };

export function overloadRecommendation(resourceId: number | undefined, formalName: string, treasure = false): OverloadRecommendation | undefined {
  const key = resourceId ?? fallbackNameIds[formalName];
  return recommendations.find((item) => item.resourceId === key && Boolean(item.treasure) === treasure)
    ?? recommendations.find((item) => item.resourceId === key && !item.treasure);
}

export const overloadRecommendationCount = recommendations.filter((item) => !item.treasure).length;
export const overloadTreasureRecommendationCount = recommendations.filter((item) => item.treasure).length;
