import { useState } from "react";
import type { CharacterDetail, CharacterSummary, NikkeRecord } from "../types";
import { emptyRecord, mergeRecord } from "../storage";
import { effectiveCollection, effectiveSkills } from "../rules/growth";
import { overloadRecommendation } from "../data/overloadRecommendations";
import { cubeRecommendation } from "../data/cubeRecommendations";
import { growthRecommendation } from "../data/growthRecommendations";
import { effectiveOverloadTargets } from "../rules/overload";
import { NikkeEquipmentSummary, NikkeStatusOverview } from "./NikkeStatusSummary";
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
type DetailTab = "growth" | "equipment" | "recommendation";

export function NikkeEditor({ character, record, detail, detailLoading, detailError, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<DetailTab>("growth");
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

  return <div className="editor detail-editor">
    <div className="detail-tabs" role="tablist" aria-label="ニケ詳細の表示内容">
      <button type="button" role="tab" aria-selected={activeTab === "growth"} className={activeTab === "growth" ? "active" : ""} onClick={() => setActiveTab("growth")}>育成</button>
      <button type="button" role="tab" aria-selected={activeTab === "equipment"} className={activeTab === "equipment" ? "active" : ""} onClick={() => setActiveTab("equipment")}>装備・OL</button>
      <button type="button" role="tab" aria-selected={activeTab === "recommendation"} className={activeTab === "recommendation" ? "active" : ""} onClick={() => setActiveTab("recommendation")}>推奨</button>
    </div>

    {activeTab === "growth" && <section className="detail-section" role="tabpanel">
      <h2>現在の育成状況</h2>
      <NikkeStatusOverview record={value} />
      <h2>スキル目標</h2>
      <div className="skill-target-table">
        <div className="skill-target-head"><span>スキル</span><span>現在値</span><span aria-hidden="true" /><span>推奨目標</span></div>
        {["スキル1", "スキル2", "バースト"].map((label, index) => <div className="skill-target-row" key={label}><strong>{label}</strong><output>{currentSkills[index]}</output><b aria-hidden="true">→</b><output className={growth && currentSkills[index] >= growth.skills[index] ? "target-met" : ""}>{growth?.skills[index] ?? "未確認"}</output></div>)}
      </div>
      {growth && <div className={`recommendation-meta ${growth.agreement === "複数ソース一致" ? "is-consensus" : "is-reference"}`}>
        <strong>{growth.agreement}</strong><span>確認日 {growth.checked}</span>
        {growth.note && <span>{growth.note}</span>}
      </div>}
    </section>}

    {activeTab === "equipment" && <section className="detail-section" role="tabpanel">
      <h2>装備・オーバーロード</h2>
      <NikkeEquipmentSummary record={value} overloadTargets={overloadTargets} />
      <OverloadGoal record={value} recommendation={recommendation} onChange={(overloadGoals) => setTarget({ overloadGoals })} />
    </section>}

    {activeTab === "recommendation" && <section className="detail-section" role="tabpanel">
      <h2>オバロ推奨</h2>
      {recommendation ? <div className="recommendation">
        <p className="overload-recommendation-head"><strong>{recommendation.classification}</strong><span>厳選優先度：{recommendation.investmentPriority}</span><span>確認日 {recommendation.checked}</span></p>
        {recommendation.reviewStatus === "unverified" ? <p className="overload-no-reroll">推奨情報をまだ確認できていません。情報がないことを「厳選不要」とは扱いません。</p>
          : idealOverloads.length > 0 ? <section className="overload-recommendation-group ideal"><h5>理想効果</h5><ul>{idealOverloads.map((item, index) => <li key={`${item.effect}-${index}`}><strong>{item.effect}</strong> {item.target}</li>)}</ul></section>
            : recommendation.investmentPriority === "厳選不要" ? <p className="overload-no-reroll">厳選の必要はありません。初回OL化や装備レベルを優先してください。</p>
              : <p className="overload-no-reroll">必須の厳選目標はありません。追加候補を参考にしてください。</p>}
        {fillerOverloads.length > 0 && <section className="overload-recommendation-group filler"><h5>あったらなお良い</h5><ul>{fillerOverloads.map((item, index) => <li key={`${item.effect}-${index}`}><strong>{item.effect}</strong> {item.target}</li>)}</ul></section>}
        {avoidedOverloads.length > 0 && <section className="overload-recommendation-group avoid"><h5>付けない効果</h5><ul>{avoidedOverloads.map((item, index) => <li key={`${item.effect}-${index}`}><strong>{item.effect}</strong> — {item.reason}</li>)}</ul></section>}
        {recommendation.note && <p className="muted">{recommendation.note}</p>}
      </div> : <p className="muted">このキャラは推奨情報との照合ができていません。推測値は表示しません。</p>}

      <h2>推奨キューブ</h2>
      <div className="recommendation cube-recommendation"><p>{cube ? cube.cubes.join(" / ") : "確認できる推奨はありません"}</p></div>

      <h2>スキル詳細</h2>
      {detailLoading && <p className="muted" role="status"><span className="spinner" aria-hidden="true" />スキル情報を取得中…</p>}
      {detailError && <p className="error-text">{detailError}</p>}
      {detail?.skills.map((skill) => <details className="skill-detail" key={skill.slot}><summary>{skill.name}{skill.cooldown ? ` / CT ${skill.cooldown}秒` : ""}</summary><p>{skill.description}</p></details>)}
    </section>}
  </div>;
}
