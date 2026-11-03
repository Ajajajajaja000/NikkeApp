import type { NikkeRecord } from "../types";
import type { OverloadRecommendation } from "../data/overloadRecommendations";
import { assessOverload } from "../rules/overload";

export function OverloadGoal({ record, recommendation }: { record: NikkeRecord; recommendation: OverloadRecommendation | undefined }) {
  const result = assessOverload(record, recommendation);
  return <section className="overload-goal">
    <h4>オバロ目標</h4>
    <div className="overload-goal-stats">
      <span><small>OL部位</small><strong>{result.overloadParts} / 4</strong></span>
      <span><small>推奨一致</small><strong>{result.matchedLines} / {result.totalLines}ライン</strong></span>
      <span className="blue-stat"><small>青字</small><strong>{result.blueLines}本</strong></span>
      <span className="black-stat"><small>黒帯</small><strong>{result.blackLines}本</strong></span>
    </div>
    <p className="next-overload-action">{result.nextAction}</p>
    {result.goals.length > 0 ? <div className="overload-goal-list">{result.goals.map((goal, index) => <div className={`overload-goal-row ${goal.met ? "met" : "missing"} ${goal.kind}`} key={`${goal.effect}-${index}`}>
      <div><strong>{goal.effect}</strong><small>推奨：{goal.target}</small></div>
      <span>{goal.kind === "avoid" ? (goal.met ? "付与なし" : `${goal.current}本・変更候補`) : goal.minimum !== undefined ? `現在 ${goal.current} / 目標 ${goal.minimum}` : goal.met ? `現在 ${goal.current}本` : "現在 0本"}</span>
    </div>)}</div> : <p className="muted">推奨本数を確認できたキャラから自動表示します。</p>}
    <p className="roll-legend"><span className="blue-sample">青字：ランク12〜14</span><span className="black-sample">黒帯：ランク15（最高値）</span></p>
  </section>;
}
