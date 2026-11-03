const elements: Record<string, string> = {
  Fire: "火力", Water: "水冷", Wind: "風圧", Iron: "鉄甲", Electric: "電撃", Electronic: "電撃",
};

const corporations: Record<string, string> = {
  ELYSION: "エリシオン", MISSILIS: "ミシリス", TETRA: "テトラ", PILGRIM: "ピルグリム", ABNORMAL: "アブノーマル",
};

const classes: Record<string, string> = {
  Attacker: "火力型", Defender: "防御型", Supporter: "支援型",
};

const weapons: Record<string, string> = {
  AR: "アサルトライフル", MG: "マシンガン", RL: "ロケットランチャー", SG: "ショットガン", SMG: "サブマシンガン", SR: "スナイパーライフル",
};

export const elementLabel = (value: string) => elements[value] || value || "属性不明";
export const corporationLabel = (value: string) => corporations[value] || value || "企業不明";
export const classLabel = (value: string) => classes[value] || value || "タイプ不明";
export const weaponLabel = (value: string) => weapons[value] || value || "武器不明";
export const burstLabel = (values: string[]) => values.length ? `バースト${values.join("/")}` : "バースト不明";
