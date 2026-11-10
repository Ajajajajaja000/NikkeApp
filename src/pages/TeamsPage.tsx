import { useMemo, useState } from "react";
import { communityPurposes, communityTeams, type CommunityPurpose, type CommunityTeamMember } from "../data/communityTeams";
import type { CharacterSummary, NikkeRecord } from "../types";
import { burstLabel, elementLabel } from "../presentation/labels";

interface Props {
  catalog: CharacterSummary[];
  records: Record<string, NikkeRecord>;
}

function resolveMember(member: CommunityTeamMember, catalog: CharacterSummary[]) {
  return (member.resourceId !== undefined ? catalog.find((character) => character.resourceId === member.resourceId) : undefined)
    ?? catalog.find((character) => character.name === member.name);
}

export function TeamsPage({ catalog, records }: Props) {
  const [purpose, setPurpose] = useState<CommunityPurpose>("campaign");
  const activePurpose = communityPurposes.find((item) => item.id === purpose) ?? communityPurposes[0];
  const teams = useMemo(() => communityTeams
    .filter((team) => team.purpose === purpose)
    .map((team) => {
      const resolved = team.members.map((member) => ({ member, character: resolveMember(member, catalog) }));
      const ownedCount = resolved.filter(({ character }) => character && records[character.id]?.owned).length;
      return { team, resolved, ownedCount };
    })
    .sort((a, b) => b.ownedCount - a.ownedCount), [purpose, catalog, records]);
  return <section className="page">
    <div className="page-title">
      <p className="eyebrow">COMMUNITY TEAMS</p>
      <h1>編成支援</h1>
    </div>

    <div className="purpose-tabs" role="tablist" aria-label="編成用途">
      {communityPurposes.map((item) => <button key={item.id} className={purpose === item.id ? "active" : ""} onClick={() => setPurpose(item.id)} role="tab" aria-selected={purpose === item.id}>{item.label}</button>)}
    </div>
    <select className="purpose-select" aria-label="編成用途" value={purpose} onChange={(event) => setPurpose(event.target.value as CommunityPurpose)}>
      {communityPurposes.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select>
    <div className="teams-result-head"><strong>{activePurpose.label}</strong><span>{teams.length}編成 · 所持数が多い順</span></div>

    {teams.map((entry) => {
      return <article className="panel community-team-card" key={entry.team.id}>
        <div className="suggestion-head">
          <div>
            <span className={`mode ${entry.team.playStyle === "フルオート候補" ? "auto" : "manual"}`}>{entry.team.playStyle}</span>
            <h2>{entry.team.title}</h2>
          </div>
          <div className={`team-readiness ${entry.ownedCount === 5 ? "complete" : ""}`} aria-label={`所持 ${entry.ownedCount} / 5`}>
            <div><span>所持</span><strong>{entry.ownedCount}<small>/5</small></strong></div>
            <span className="readiness-track" aria-hidden="true"><i style={{ width: `${entry.ownedCount * 20}%` }} /></span>
          </div>
        </div>

        <div className="team-line" aria-label={`${entry.team.title}のメンバー`}>
          {entry.resolved.map(({ member, character }, index) => {
            const record = character ? records[character.id] : undefined;
            const owned = Boolean(record?.owned);
            const treasure = Boolean(record?.imported?.collection?.treasure);
            return <div className={`team-member ${owned ? "is-owned" : ""}`} key={`${member.resourceId ?? member.name}-${index}`}>
              <span className="position">{index + 1}</span>
              <div className="team-avatar">{character?.icon ? <img src={character.icon} alt="" loading="lazy" /> : member.name.slice(0, 1)}</div>
              <strong title={character?.name ?? member.name}>{character?.name ?? member.name}</strong>
              <small>{character ? `${burstLabel(character.bursts)} · ${elementLabel(character.element)}` : "図鑑データ確認中"}</small>
              <span className={`ownership ${owned ? "owned" : "unowned"}`}>{owned ? "所持" : "未所持"}</span>
              {member.treasure && <span className={`treasure-status ${treasure ? "ready" : "needed"}`}>{treasure ? "宝もの解放済" : owned ? "宝もの未解放" : "宝もの必要"}</span>}
            </div>;
          })}
        </div>

        <p className="team-summary">{entry.team.summary}</p>
        <details className="team-more">
          <summary><span>運用・代替・出典</span><small>{entry.team.substitutions.length > 0 ? `代替 ${entry.team.substitutions.length}枠` : "代替なし"}</small><b aria-hidden="true">⌄</b></summary>
          <div className="team-more-body">
            <p className="order-note"><strong>並び順：</strong>{entry.team.orderNote}</p>
            <div className="team-guidance">
              <h3>実戦時の確認</h3>
              <ul>{entry.team.notes.map((note) => <li key={note}>{note}</li>)}</ul>
            </div>
            {entry.team.substitutions.length > 0 && <div className="team-substitutions">
              <h3>掲載元の枠別代替候補</h3>
              <div className="substitution-list">{entry.team.substitutions.map((substitution) => {
                const original = entry.team.members[substitution.memberIndex];
                return <div className="substitution-row" key={`${entry.team.id}-${substitution.memberIndex}`}>
                  <div className="substitution-original">
                    <small>{substitution.memberIndex + 1}枠目</small>
                    <strong>{original?.name ?? "対象枠"}</strong>
                  </div>
                  <span className="substitution-arrow" aria-label="の代替">→</span>
                  <div className="substitution-candidates">{substitution.candidates.map((candidate) => {
                    const character = resolveMember(candidate, catalog);
                    const owned = Boolean(character && records[character.id]?.owned);
                    return <span className={`substitute-chip ${owned ? "is-owned" : ""}`} key={`${candidate.resourceId ?? candidate.name}`}>
                      <span>{character?.name ?? candidate.name}</span>
                      <small>{owned ? "所持" : "未所持"}</small>
                    </span>;
                  })}</div>
                  {substitution.note && <p>{substitution.note}</p>}
                </div>;
              })}</div>
            </div>}
            <p className="verification-note"><strong>複数ソース照合：</strong>{entry.team.verification}</p>
            <div className="community-source">
              <span>掲載元更新日：{entry.team.source.updated.replaceAll("-", "/")}</span>
              <span>確認日：{entry.team.source.checked.replaceAll("-", "/")}</span>
              <span>掲載元：{entry.team.source.title}</span>
            </div>
          </div>
        </details>
      </article>;
    })}
  </section>;
}
