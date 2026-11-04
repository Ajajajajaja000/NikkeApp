import type { CharacterDetail, CharacterSummary, NikkeRecord } from "../types";
import { emptyRecord, mergeRecord } from "../storage";
import { effectiveCollection, effectiveSkills } from "../rules/growth";
import { overloadRecommendation } from "../data/overloadRecommendations";
import { cubeRecommendation } from "../data/cubeRecommendations";
import { growthRecommendation } from "../data/growthRecommendations";
import { effectiveOverloadTargets } from "../rules/overload";
import { NikkeStatusSummary } from "./NikkeStatusSummary";
import { OverloadGoal } from "./OverloadGoal";

interface Props {
  character: CharacterSummary;
  record?: NikkeRecord;
  detail?: CharacterDetail;
  detailLoading?: boolean;
  detailError?: string;
  onChange: (record: NikkeRecord) => void;
}

type GrowthTarget = NonNullable<NikkeRecord["target"]>;

export function NikkeEditor({ character, record, detail, detailLoading, detailError, onChange }: Props) {
  const value = mergeRecord(emptyRecord(), record ?? {});
  const currentSkills = effectiveSkills(value);
  const target = value.target ?? {};
  const treasure = effectiveCollection(value).treasure;
  const recommendation = overloadRecommendation(character.resourceId, character.name, treasure);
  const cube = cubeRecommendation(character.resourceId);
  const idealOverloads = recommendation?.priorities.filter((item) => item.kind === "ideal") ?? [];
  const fillerOverloads = recommendation?.priorities.filter((item) => item.kind === "filler") ?? [];
  const avoidedOverloads = recommendation?.priorities.filter((item) => item.kind === "avoid") ?? [];
  const growth = growthRecommendation(character.resourceId);
  const overloadTargets = effectiveOverloadTargets(value, recommendation);
  const set = (patch: Partial<NikkeRecord>) => onChange({ ...value, ...patch, displayName: character.name, manualUpdatedAt: new Date().toISOString() });
  const setTarget = (patch: Partial<GrowthTarget>) => set({ target: { ...target, ...patch } });

  return <div className="editor" onClick={(event) => event.stopPropagation()}>
    <h4>BlablaLink取込値</h4>
    <NikkeStatusSummary record={value} overloadTargets={overloadTargets} />

    <h4>育成目標</h4>
    <div className="skill-target-table">
      <div className="skill-target-head"><span>スキル</span><span>現在値</span><span aria-hidden="true" /><span>推奨目標</span></div>
      {["スキル1", "スキル2", "バースト"].map((label, index) => <div className="skill-target-row" key={label}><strong>{label}</strong><output>{currentSkills[index]}</output><b aria-hidden="true">→</b><output className={growth && currentSkills[index] >= growth.skills[index] ? "target-met" : ""}>{growth?.skills[index] ?? "未確認"}</output></div>)}
    </div>
    {growth && <div className={`recommendation-meta ${growth.agreement === "複数ソース一致" ? "is-consensus" : "is-reference"}`}>
      <strong>{growth.agreement}</strong><span>確認日 {growth.checked}</span>
      {growth.note && <span>{growth.note}</span>}
    </div>}
    <OverloadGoal record={value} recommendation={recommendation} onChange={(overloadGoals) => setTarget({ overloadGoals })} />

    <h4>オバロ推奨</h4>
    {recommendation ? <div className="recommendation">
      <p className="overload-recommendation-head"><strong>{recommendation.classification}</strong><span>厳選優先度：{recommendation.investmentPriority}</span><span>確認日 {recommendation.checked}</span></p>
      {idealOverloads.length > 0 ? <section className="overload-recommendation-group ideal"><h5>理想効果</h5><ul>{idealOverloads.map((item, index) => <li key={`${item.effect}-${index}`}><strong>{item.effect}</strong> {item.target}</li>)}</ul></section>
        : <p className="overload-no-reroll">厳選の必要はありません。初回OL化や装備レベルを優先してください。</p>}
      {fillerOverloads.length > 0 && <section className="overload-recommendation-group filler"><h5>あったらなお良い</h5><ul>{fillerOverloads.map((item, index) => <li key={`${item.effect}-${index}`}><strong>{item.effect}</strong> {item.target}</li>)}</ul></section>}
      {avoidedOverloads.length > 0 && <section className="overload-recommendation-group avoid"><h5>付けない効果</h5><ul>{avoidedOverloads.map((item, index) => <li key={`${item.effect}-${index}`}><strong>{item.effect}</strong> — {item.reason}</li>)}</ul></section>}
    </div> : <p className="muted">このキャラは推奨情報との照合ができていません。推測値は表示しません。</p>}

    <h4>推奨キューブ</h4>
    <div className="recommendation cube-recommendation"><p>{cube ? cube.cubes.join(" / ") : "確認できる推奨はありません"}</p></div>

    <h4>API詳細（必要時だけ取得）</h4>
    {detailLoading && <p className="muted" role="status"><span className="spinner" aria-hidden="true" />スキル情報を取得中…</p>}
    {detailError && <p className="error-text">{detailError}</p>}
    {detail?.skills.map((skill) => <details className="skill-detail" key={skill.slot}><summary>{skill.name}{skill.cooldown ? ` / CT ${skill.cooldown}秒` : ""}</summary><p>{skill.description}</p></details>)}
  </div>;
}
