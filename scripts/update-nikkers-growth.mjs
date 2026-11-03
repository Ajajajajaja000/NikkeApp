import { writeFile } from "node:fs/promises";

const endpoint = "https://nikkers.cc/nikkes?limit=500&include_sr=true";
const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`Nikkers API: HTTP ${response.status}`);
const payload = await response.json();
if (!payload.success || !Array.isArray(payload.data)) throw new Error("Nikkers APIの形式が変わりました。");

const targets = Object.fromEntries(payload.data
  .filter((item) => Number.isFinite(item.resource_id) && [item.skill1_target, item.skill2_target, item.burst_target].every(Number.isFinite))
  .map((item) => [item.resource_id, [item.skill1_target, item.skill2_target, item.burst_target]]));
const checked = new Date().toISOString().slice(0, 10);
const entries = Object.entries(targets).map(([id, skills]) => `  ${id}: ${JSON.stringify(skills)},`).join("\n");
const output = `export interface GrowthRecommendation {
  skills: [number, number, number];
  checked: string;
  sourceUrl: string;
}

const checked = "${checked}";
const sourceUrl = "https://nikkers.cc/api";

// Nikkers公開APIの推奨値を、開発時の手動コマンド1回で更新した静的データ。
// アプリ利用中はNikkersへ通信せず、resourceIdで別衣装も厳密に区別する。
const skillTargets: Record<number, [number, number, number]> = {
${entries}
};

export function growthRecommendation(resourceId: number | undefined): GrowthRecommendation | undefined {
  if (resourceId === undefined) return undefined;
  const skills = skillTargets[resourceId];
  return skills ? { skills, checked, sourceUrl } : undefined;
}

export const growthRecommendationCount = Object.keys(skillTargets).length;
`;
await writeFile(new URL("../src/data/growthRecommendations.ts", import.meta.url), output, "utf8");
console.log(`${Object.keys(targets).length}体の推奨スキル値を1リクエストで更新しました。`);
