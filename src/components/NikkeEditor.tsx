import type { CharacterDetail, CharacterSummary, NikkeRecord } from "../types";
import { emptyRecord, mergeRecord } from "../storage";
import { effectiveSkills } from "../rules/growth";
import { overloadRecommendation } from "../data/overloadRecommendations";
import { NikkeStatusSummary } from "./NikkeStatusSummary";

const tiers = ["T7", "T8", "T9", "T9企業", "OL"];

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
    <p className="muted">左がBlablaLinkの現在値、右だけがこのアプリで設定する目標値です。</p>
    <div className="skill-row">
      {["S1", "S2", "B"].map((label, index) => <label key={label}>{label}<span><output>{currentSkills[index]}</output><b>→</b><input aria-label={`${label}目標レベル`} type="number" min="1" max="10" value={target.skills[index]} onChange={(e) => setTargetSkill(index, Number(e.target.value))} /></span></label>)}
    </div>
    <div className="form-grid target-grid">
      <label>装備目標<select value={target.gearTier} onChange={(e) => setTarget({ gearTier: e.target.value })}>{tiers.map((tier) => <option key={tier}>{tier}</option>)}</select></label>
      <label>オバロ目標部位<input type="number" min="0" max="4" value={target.overloadCount} onChange={(e) => setTarget({ overloadCount: Number(e.target.value) })} /></label>
      <label>キューブ目標Lv<input type="number" min="0" max="15" value={target.cubeLevel} onChange={(e) => setTarget({ cubeLevel: Number(e.target.value) })} /></label>
    </div>

    <h4>オバロ推奨</h4>
    {recommendation ? <div className="recommendation">
      <p>{recommendation.classification}（確認日 {recommendation.checked}）</p>
      <ul>{recommendation.priorities.map((item, index) => <li key={`${item.effect}-${index}`}><strong>{item.effect}</strong> {item.target} — {item.reason}</li>)}</ul>
      {recommendation.cubes.length > 0 && <p>キューブ候補: {recommendation.cubes.join(" / ")}</p>}
      <p className="muted">公開APIのキャラ別記載をアプリ更新時に確認した静的情報です。Nikkers APIはブラウザから直接取得せず、推奨の自動更新は行いません。</p>
      <div className="recommendation-sources">{recommendation.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div>
    </div> : <p className="muted">このキャラは公開ビルド情報とのresourceId照合ができていません。推測値は表示しません。</p>}

    <label>メモ<textarea rows={2} value={value.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} /></label>

    <h4>API詳細（必要時だけ取得）</h4>
    {detailLoading && <p className="muted" role="status"><span className="spinner" aria-hidden="true" />スキル情報を取得中…</p>}
    {detailError && <p className="error-text">{detailError}</p>}
    {detail?.skills.map((skill) => <details className="skill-detail" key={skill.slot}><summary>{skill.name}{skill.cooldown ? ` / CT ${skill.cooldown}秒` : ""}</summary><p>{skill.description}</p></details>)}
  </div>;
}
