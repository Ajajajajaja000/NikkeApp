import type { CharacterDetail, CharacterSummary, NikkeRecord } from "../types";
import { emptyRecord, mergeRecord } from "../storage";
import { effectiveSkills } from "../rules/growth";
import { overloadRecommendation } from "../data/overloadRecommendations";
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
  const recommendation = overloadRecommendation(character.resourceId, character.name);
  const growth = growthRecommendation(character.resourceId);
  const overloadTargets = effectiveOverloadTargets(value, recommendation);
  const set = (patch: Partial<NikkeRecord>) => onChange({ ...value, ...patch, displayName: character.name, manualUpdatedAt: new Date().toISOString() });
  const setTarget = (patch: Partial<GrowthTarget>) => set({ target: { ...target, ...patch } });

  return <div className="editor" onClick={(event) => event.stopPropagation()}>
    <h4>BlablaLink取込値</h4>
    <NikkeStatusSummary record={value} overloadTargets={overloadTargets} />

    <h4>育成目標</h4>
    <p className="muted">現在値はBlablaLink、目標値は公開攻略で頻出する値を優先しています。複数ソースが一致しないキャラは参考値と明記します。</p>
    <div className="skill-target-table">
      <div className="skill-target-head"><span>スキル</span><span>現在値</span><span aria-hidden="true" /><span>推奨目標</span></div>
      {["スキル1", "スキル2", "バースト"].map((label, index) => <div className="skill-target-row" key={label}><strong>{label}</strong><output>{currentSkills[index]}</output><b aria-hidden="true">→</b><output className={growth && currentSkills[index] >= growth.skills[index] ? "target-met" : ""}>{growth?.skills[index] ?? "未確認"}</output></div>)}
    </div>
    {growth && <div className={`recommendation-meta ${growth.agreement === "複数ソース一致" ? "is-consensus" : "is-reference"}`}>
      <strong>{growth.agreement}</strong><span>確認日 {growth.checked}</span>
      {growth.note && <span>{growth.note}</span>}
      <span className="recommendation-source-links">{growth.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</span>
    </div>}
    <OverloadGoal record={value} recommendation={recommendation} onChange={(overloadGoals) => setTarget({ overloadGoals })} />

    <h4>オバロ推奨</h4>
    {recommendation ? <div className="recommendation">
      <p><strong>{recommendation.classification}</strong>（確認日 {recommendation.checked}）</p>
      <ul>{recommendation.priorities.map((item, index) => <li key={`${item.effect}-${index}`}><strong>{item.effect}</strong> {item.target} — {item.reason}</li>)}</ul>
      <p><strong>推奨キューブ：</strong>{recommendation.cubes.length > 0 ? recommendation.cubes.join(" / ") : "確認できる掲載なし"}</p>
      <div className="recommendation-sources">{recommendation.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
    </div> : <p className="muted">このキャラは公開ビルド情報との照合ができていません。推測値は表示しません。</p>}

    <label>メモ<textarea rows={2} value={value.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} /></label>

    <h4>API詳細（必要時だけ取得）</h4>
    {detailLoading && <p className="muted" role="status"><span className="spinner" aria-hidden="true" />スキル情報を取得中…</p>}
    {detailError && <p className="error-text">{detailError}</p>}
    {detail?.skills.map((skill) => <details className="skill-detail" key={skill.slot}><summary>{skill.name}{skill.cooldown ? ` / CT ${skill.cooldown}秒` : ""}</summary><p>{skill.description}</p></details>)}
  </div>;
}
