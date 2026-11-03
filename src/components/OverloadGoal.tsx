import { useState } from "react";
import type { NikkeRecord, OverloadTarget } from "../types";
import type { OverloadRecommendation } from "../data/overloadRecommendations";
import { assessOverload, effectiveOverloadTargets } from "../rules/overload";

const effectOptions = ["有利コードダメージ増加", "攻撃力増加", "最大装弾数増加", "チャージ速度増加", "チャージダメージ増加", "命中率増加", "クリティカル確率増加", "クリティカルダメージ増加", "最大HP増加", "防御力増加"];

interface Props {
  record: NikkeRecord;
  recommendation: OverloadRecommendation | undefined;
  onChange: (goals: OverloadTarget[] | undefined) => void;
}

export function OverloadGoal({ record, recommendation, onChange }: Props) {
  const goals = effectiveOverloadTargets(record, recommendation);
  const manual = record.target?.overloadGoals !== undefined;
  const [draft, setDraft] = useState<OverloadTarget[] | null>(null);
  const editing = draft !== null;
  const visibleGoals = draft ?? goals;
  const result = assessOverload(record, visibleGoals);
  const startEditing = () => setDraft(goals.length ? goals.map((goal) => ({ ...goal })) : [{ effect: "有利コードダメージ増加", target: "1枠" }]);
  const update = (index: number, patch: Partial<OverloadTarget>) => setDraft((current) => current?.map((goal, row) => row === index ? { ...goal, ...patch } : goal) ?? null);
  const save = () => {
    if (!draft) return;
    onChange(draft);
    setDraft(null);
  };
  const reset = () => {
    if (window.confirm("このニケの手動オバロ目標を削除して、公開推奨に戻しますか？")) onChange(undefined);
  };
  return <section className="overload-goal">
    <div className="overload-goal-head"><h4>オバロ目標</h4>{!editing && <div className="overload-goal-actions">
      <button className="text-button" type="button" onClick={startEditing}>{manual ? "手動目標を編集" : "手動で変更"}</button>
      {manual && <button className="text-button danger-text" type="button" onClick={reset}>公開推奨に戻す</button>}
    </div>}</div>
    <div className="overload-goal-stats">
      <span><small>OL部位</small><strong>{result.overloadParts} / 4</strong></span>
      <span><small>推奨一致</small><strong>{result.matchedLines} / {result.totalLines}ライン</strong></span>
      <span className="blue-stat"><small>青字</small><strong>{result.blueLines}本</strong></span>
      <span className="black-stat"><small>黒帯</small><strong>{result.blackLines}本</strong></span>
    </div>
    <p className="next-overload-action">{result.nextAction}</p>
    {editing && draft && <div className="overload-goal-editor" aria-label="オバロ目標の手動設定">
      {draft.map((goal, index) => <div className="overload-goal-edit-row" key={`edit-${index}`}>
        <select aria-label={`オバロ目標${index + 1}の効果`} value={goal.effect} onChange={(event) => update(index, { effect: event.target.value })}>{!effectOptions.includes(goal.effect) && <option>{goal.effect}</option>}{effectOptions.map((effect) => <option key={effect}>{effect}</option>)}</select>
        <input aria-label={`オバロ目標${index + 1}の本数または条件`} value={goal.target} onChange={(event) => update(index, { target: event.target.value })} placeholder="例：4枠 / 優先" />
        <button type="button" className="icon-button" aria-label={`オバロ目標${index + 1}を削除`} onClick={() => setDraft(draft.filter((_, row) => row !== index))}>×</button>
      </div>)}
      <button type="button" className="secondary add-goal" onClick={() => setDraft([...draft, { effect: "有利コードダメージ増加", target: "1枠" }])}>＋ 効果を追加</button>
      <p className="muted">入力中はまだ保存されません。内容を確認して「変更を保存」を押してください。</p>
      <div className="edit-decision-row"><button type="button" className="primary" onClick={save}>変更を保存</button><button type="button" className="secondary" onClick={() => setDraft(null)}>キャンセル</button></div>
    </div>}
    {result.goals.length > 0 ? <div className="overload-goal-list">{result.goals.map((goal, index) => <div className={`overload-goal-row ${goal.met ? "met" : "missing"} ${goal.kind}`} key={`${goal.effect}-${index}`}>
      <div><strong>{goal.effect}</strong><small>{editing ? "編集中" : manual ? "手動目標" : "公開推奨"}：{goal.target}</small></div>
      <span>{goal.kind === "avoid" ? (goal.met ? "付与なし" : `${goal.current}本・変更候補`) : goal.minimum !== undefined ? `現在 ${goal.current} / 目標 ${goal.minimum}` : goal.met ? `現在 ${goal.current}本` : "現在 0本"}</span>
    </div>)}</div> : <p className="muted">公開推奨を確認できていません。「手動で変更」から目標を登録できます。</p>}
    <p className="roll-legend"><span className="blue-sample">青字：ランク12〜14</span><span className="black-sample">黒帯：ランク15（最高値）</span></p>
  </section>;
}
