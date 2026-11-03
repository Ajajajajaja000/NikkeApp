import { useMemo, useState } from "react";
import type { CharacterSummary, NikkeRecord, SavedTeam, TeamSuggestion } from "../types";
import { buildTeam, purposes, type Purpose } from "../rules/teamBuilder";

interface Props {
  catalog: CharacterSummary[];
  records: Record<string, NikkeRecord>;
  savedTeams: SavedTeam[];
  onSavedTeamsChange: (teams: SavedTeam[]) => void;
}

function TeamLine({ ids, byId, records, showOwnership = false }: { ids: string[]; byId: Record<string, CharacterSummary>; records: Record<string, NikkeRecord>; showOwnership?: boolean }) {
  return <div className="team-line">{ids.map((id, index) => {
    const character = byId[id];
    const owned = records[id]?.owned;
    return <div className="team-member" key={`${id}-${index}`}>
      <span className="position">{index + 1}</span>
      <div className="team-avatar">{character?.icon ? <img src={character.icon} alt="" loading="lazy" /> : character?.name.slice(0, 1)}</div>
      <strong title={character?.name}>{character?.name ?? records[id]?.displayName ?? id}</strong>
      <small>B{character?.bursts.join("/") || "?"} · {character?.element}</small>
      {showOwnership && <span className={`ownership ${owned ? "owned" : "unowned"}`}>{owned ? "所持" : "未所持"}</span>}
    </div>;
  })}</div>;
}

export function TeamsPage({ catalog, records, savedTeams, onSavedTeamsChange }: Props) {
  const [purpose, setPurpose] = useState<Purpose>("campaign");
  const suggestion = useMemo<TeamSuggestion>(() => buildTeam(purpose, catalog, records), [purpose, catalog, records]);
  const byId = Object.fromEntries(catalog.map((character) => [character.id, character]));
  const save = () => {
    if (!suggestion.characterIds.length) return;
    const team: SavedTeam = { id: crypto.randomUUID(), name: suggestion.title, purpose, characterIds: suggestion.characterIds, createdAt: new Date().toISOString() };
    onSavedTeamsChange([team, ...savedTeams]);
  };

  return <section className="page">
    <div className="page-title"><p className="eyebrow">SQUAD LAB</p><h1>編成支援</h1><p>所持を最優先し、育成値に左右されないルール方式</p></div>
    <article className="panel rule-source">
      <h2>この画面のデータと判定</h2>
      <dl><div><dt>非公式NIKKE API</dt><dd>正式名称、属性、武器、バースト段階</dd></div><div><dt>BlablaLink</dt><dd>所持しているかの判定</dd></div><div><dt>アプリ内ルール</dt><dd>代表的なCT短縮・回復・ゲージ生成・再突入と属性相性</dd></div></dl>
      <p>APIが最適編成を返しているわけではありません。登録済みの代表役とバースト成立を使う独自判定で、勝率やクリアを保証しません。</p>
    </article>
    <div className="purpose-tabs" role="tablist" aria-label="編成用途">{purposes.map((item) => <button key={item.id} className={purpose === item.id ? "active" : ""} onClick={() => setPurpose(item.id)}>{item.label}</button>)}</div>
    <article className="panel suggestion-panel">
      <div className="suggestion-head"><div><span className={`mode ${suggestion.mode === "フルオート向け" ? "auto" : "manual"}`}>{suggestion.mode}</span><h2>所持ニケでの候補</h2></div><button className="primary small" onClick={save} disabled={!suggestion.characterIds.length}>この所持編成を保存</button></div>
      <p className="muted">左からの推奨配置順。育成状況は選出順位に使いません。</p>
      <TeamLine ids={suggestion.characterIds} byId={byId} records={records} />
      {suggestion.characterIds.length === 0 && <div className="empty-state slim"><p>所持ニケを登録すると候補を作成します。</p></div>}
      <div className="analysis-grid">
        <div><h3>採用理由</h3><ul>{suggestion.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
        <div><h3>苦手・確認事項</h3><ul>{suggestion.cautions.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
      </div>
      <div><h3>所持ニケの代用候補</h3>{suggestion.alternatives.length ? <div className="alternative-list">{suggestion.alternatives.map((item) => <span key={item}>{item}</span>)}</div> : <p className="muted">他の所持候補はありません。</p>}</div>
    </article>

    <article className="panel reference-team">
      <div><p className="eyebrow">REFERENCE</p><h2>参考目標編成</h2></div>
      <p>所持・未所持に関係なく、現在の図鑑全体へ同じルールを適用した育成目標の参考です。コミュニティ検証済みの最適編成ではありません。</p>
      <TeamLine ids={suggestion.referenceCharacterIds} byId={byId} records={records} showOwnership />
    </article>

    {savedTeams.length > 0 && <><div className="section-heading"><div><p className="eyebrow">SAVED</p><h2>保存編成</h2><p className="muted">候補を再計算しても残る控えです。ゲーム内の編成メモや候補比較に使えます。</p></div></div><div className="saved-teams">{savedTeams.map((team) => <article className="saved-team" key={team.id}><div><h3>{team.name}</h3><p>{team.characterIds.map((id) => byId[id]?.name ?? records[id]?.displayName ?? id).join(" → ")}</p><small>保存日時：{new Date(team.createdAt).toLocaleString("ja-JP")}</small></div><button className="danger-link" onClick={() => onSavedTeamsChange(savedTeams.filter((item) => item.id !== team.id))}>削除</button></article>)}</div></>}
  </section>;
}
