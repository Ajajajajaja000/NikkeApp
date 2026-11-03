import type { CharacterDetail, CharacterSummary, NikkeRecord } from "../types";
import { emptyRecord, mergeRecord } from "../storage";
import { effectiveSkills } from "../rules/growth";
import { overloadRecommendation } from "../data/overloadRecommendations";
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
  const target = value.target ?? { skills: [7, 7, 7] as [number, number, number], gearTier: "T9", overloadCount: 4, cubeLevel: 7 };
  const recommendation = overloadRecommendation(character.resourceId, character.name);
  const set = (patch: Partial<NikkeRecord>) => onChange({ ...value, ...patch, displayName: character.name, manualUpdatedAt: new Date().toISOString() });
  const setTarget = (patch: Partial<GrowthTarget>) => set({ target: { ...target, ...patch } });
  const setTargetSkill = (index: number, level: number) => {
    const skills = [...target.skills] as [number, number, number];
    skills[index] = level;
    setTarget({ skills });
  };

  return <div className="editor" onClick={(event) => event.stopPropagation()}>
    <h4>BlablaLink取込値</h4>
    <NikkeStatusSummary record={value} />

    <h4>育成目標</h4>
    <p className="muted">現在値はBlablaLinkから取得し、目標値だけを変更できます。</p>
    <div className="skill-target-table">
      <div className="skill-target-head"><span>スキル</span><span>現在値</span><span aria-hidden="true" /><span>目標値</span></div>
      {["スキル1", "スキル2", "バースト"].map((label, index) => <label className="skill-target-row" key={label}><strong>{label}</strong><output>{currentSkills[index]}</output><b aria-hidden="true">→</b><input aria-label={`${label}の目標レベル`} type="number" min="1" max="10" value={target.skills[index]} onChange={(e) => setTargetSkill(index, Number(e.target.value))} /></label>)}
    </div>
    <OverloadGoal record={value} recommendation={recommendation} />
    <label className="cube-target">キューブ目標Lv<input type="number" min="0" max="15" value={target.cubeLevel} onChange={(e) => setTarget({ cubeLevel: Number(e.target.value) })} /></label>

    <h4>オバロ推奨</h4>
    {recommendation ? <div className="recommendation">
      <p>{recommendation.classification}（確認日 {recommendation.checked}）</p>
      <ul>{recommendation.priorities.map((item, index) => <li key={`${item.effect}-${index}`}><strong>{item.effect}</strong> {item.target} — {item.reason}</li>)}</ul>
      {recommendation.cubes.length > 0 && <p>キューブ候補: {recommendation.cubes.join(" / ")}</p>}
      <p className="muted">公開APIのキャラ別記載を、新キャラ追加・既存ビルド変更時に確認する静的情報です。Nikkers APIはブラウザから直接取得しません。</p>
      <div className="recommendation-sources">{recommendation.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
    </div> : <p className="muted">このキャラは公開ビルド情報とのresourceId照合ができていません。推測値は表示しません。</p>}

    <label>メモ<textarea rows={2} value={value.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} /></label>

    <h4>API詳細（必要時だけ取得）</h4>
    {detailLoading && <p className="muted" role="status"><span className="spinner" aria-hidden="true" />スキル情報を取得中…</p>}
    {detailError && <p className="error-text">{detailError}</p>}
    {detail?.skills.map((skill) => <details className="skill-detail" key={skill.slot}><summary>{skill.name}{skill.cooldown ? ` / CT ${skill.cooldown}秒` : ""}</summary><p>{skill.description}</p></details>)}
  </div>;
}
