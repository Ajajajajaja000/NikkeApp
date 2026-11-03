import { useMemo, useState } from "react";
import type { CharacterSummary, NikkeRecord, SavedTeam, TeamSuggestion } from "../types";
import { buildTeam, purposes } from "../rules/teamBuilder";

interface Props {
  catalog: CharacterSummary[];
  records: Record<string, NikkeRecord>;
  savedTeams: SavedTeam[];
  onSavedTeamsChange: (teams: SavedTeam[]) => void;
}

export function TeamsPage({ catalog, records, savedTeams, onSavedTeamsChange }: Props) {
  const [purpose, setPurpose] = useState<(typeof purposes)[number]["id"]>("campaign");
  const suggestion = useMemo<TeamSuggestion>(() => buildTeam(purpose, catalog, records), [purpose, catalog, records]);
  const byId = Object.fromEntries(catalog.map((character) => [character.id, character]));
  const save = () => {
    if (!suggestion.characterIds.length) return;
    const team: SavedTeam = { id: crypto.randomUUID(), name: suggestion.title, purpose, characterIds: suggestion.characterIds, createdAt: new Date().toISOString() };
    onSavedTeamsChange([team, ...savedTeams]);
  };

  return <section className="page">
    <div className="page-title"><p className="eyebrow">SQUAD LAB</p><h1>編成支援</h1><p>所持と実育成値を優先する端末内ルール判定</p></div>
    <div className="purpose-tabs" role="tablist" aria-label="編成用途">{purposes.map((item) => <button key={item.id} className={purpose === item.id ? "active" : ""} onClick={() => setPurpose(item.id)}>{item.label}</button>)}</div>
    <article className="panel suggestion-panel">
      <div className="suggestion-head"><div><span className={`mode ${suggestion.mode === "フルオート向け" ? "auto" : "manual"}`}>{suggestion.mode}</span><h2>{suggestion.title}</h2></div><button className="primary small" onClick={save} disabled={!suggestion.characterIds.length}>保存</button></div>
      <p className="muted">左からの推奨配置順 · 育成平均スコア {suggestion.score}（相対比較用。勝率ではありません）</p>
      <div className="team-line">{suggestion.characterIds.map((id, index) => {
        const character = byId[id];
        return <div className="team-member" key={id}><span className="position">{index + 1}</span><div className="team-avatar">{character?.icon ? <img src={character.icon} alt="" /> : character?.name.slice(0, 1)}</div><strong>{character?.name ?? records[id]?.displayName ?? id}</strong><small>B{character?.bursts.join("/") || "?"} · {character?.element}</small></div>;
      })}</div>
      {suggestion.characterIds.length === 0 && <div className="empty-state slim"><p>所持ニケを登録すると候補を作成します。</p></div>}
      <div className="analysis-grid">
        <div><h3>採用理由</h3><ul>{suggestion.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
        <div><h3>苦手・確認事項</h3><ul>{suggestion.cautions.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
      </div>
      <div><h3>代用候補</h3>{suggestion.alternatives.length ? <div className="alternative-list">{suggestion.alternatives.map((item) => <span key={item}>{item}</span>)}</div> : <p className="muted">他の所持候補はありません。</p>}</div>
      <p className="rule-disclaimer">判定範囲：バーストⅠ・Ⅱ・Ⅲの成立、既知の再突入、属性相性、育成度、回復・CT短縮・ゲージ生成の代表役。個別ボス行動、全スキル相互作用、操作精度、ダメージ計算は未再現です。</p>
    </article>
    {savedTeams.length > 0 && <><div className="section-heading"><div><p className="eyebrow">SAVED</p><h2>保存編成</h2></div></div><div className="saved-teams">{savedTeams.map((team) => <article className="saved-team" key={team.id}><div><h3>{team.name}</h3><p>{team.characterIds.map((id) => byId[id]?.name ?? records[id]?.displayName ?? id).join(" → ")}</p><small>{new Date(team.createdAt).toLocaleString("ja-JP")}</small></div><button className="danger-link" onClick={() => onSavedTeamsChange(savedTeams.filter((item) => item.id !== team.id))}>削除</button></article>)}</div></>}
  </section>;
}
