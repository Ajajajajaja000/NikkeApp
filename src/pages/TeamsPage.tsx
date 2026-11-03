import { useMemo, useState } from "react";
import { communityPurposes, communityTeams, type CommunityPurpose, type CommunityTeamMember } from "../data/communityTeams";
import type { CharacterSummary, NikkeRecord } from "../types";
import { burstLabel, elementLabel } from "../presentation/labels";

interface Props {
  catalog: CharacterSummary[];
  records: Record<string, NikkeRecord>;
}

function resolveMember(member: CommunityTeamMember, catalog: CharacterSummary[]) {
  return catalog.find((character) => character.resourceId === member.resourceId)
    ?? catalog.find((character) => character.name === member.name);
}

export function TeamsPage({ catalog, records }: Props) {
  const [purpose, setPurpose] = useState<CommunityPurpose>("campaign");
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
      <p>公開攻略で紹介された完成編成を、所持状況と照らして確認できます。</p>
    </div>

    <article className="panel community-policy">
      <h2>この画面について</h2>
      <p>複数の攻略元から更新日・根拠・用途を比較して採用しています。アプリが独自にメンバーを組み合わせることはなく、BlablaLinkの取込値は掲載編成を組めるかの確認にだけ使います。</p>
      <div className="policy-points">
        <span>攻略元の5人を固定表示</span>
        <span>未所持も目標として表示</span>
        <span>更新日・出典・確認日を明記</span>
      </div>
    </article>

    <div className="purpose-tabs" role="tablist" aria-label="編成用途">
      {communityPurposes.map((item) => <button key={item.id} className={purpose === item.id ? "active" : ""} onClick={() => setPurpose(item.id)} role="tab" aria-selected={purpose === item.id}>{item.label}</button>)}
    </div>

    {teams.map((entry) => {
      return <article className="panel community-team-card" key={entry.team.id}>
        <div className="suggestion-head">
          <div>
            <span className={`mode ${entry.team.playStyle === "フルオート候補" ? "auto" : "manual"}`}>{entry.team.playStyle}</span>
            <h2>{entry.team.title}</h2>
            <p className="readiness">所持 <strong>{entry.ownedCount}</strong> / 5</p>
          </div>
        </div>

        <div className="team-line" aria-label={`${entry.team.title}のメンバー`}>
          {entry.resolved.map(({ member, character }, index) => {
            const record = character ? records[character.id] : undefined;
            const owned = Boolean(record?.owned);
            const treasure = Boolean(record?.imported?.collection?.treasure);
            return <div className={`team-member ${owned ? "is-owned" : ""}`} key={member.resourceId}>
              <span className="position">{index + 1}</span>
              <div className="team-avatar">{character?.icon ? <img src={character.icon} alt="" loading="lazy" /> : member.name.slice(0, 1)}</div>
              <strong title={character?.name ?? member.name}>{character?.name ?? member.name}</strong>
              <small>{character ? `${burstLabel(character.bursts)} · ${elementLabel(character.element)}` : "図鑑データ確認中"}</small>
              <span className={`ownership ${owned ? "owned" : "unowned"}`}>{owned ? "所持" : "未所持"}</span>
              {member.treasure && <span className={`treasure-status ${treasure ? "ready" : "needed"}`}>{treasure ? "宝もの解放済" : owned ? "宝もの未解放" : "宝もの必要"}</span>}
            </div>;
          })}
        </div>

        <p className="order-note"><strong>並び順：</strong>{entry.team.orderNote}</p>
        <p>{entry.team.summary}</p>
        <div className="team-guidance">
          <h3>実戦時の確認</h3>
          <ul>{entry.team.notes.map((note) => <li key={note}>{note}</li>)}</ul>
        </div>
        {entry.team.substitutions.length > 0 && <div className="team-substitutions">
          <h3>掲載元にある代替例</h3>
          <ul>{entry.team.substitutions.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>}
        <div className="community-source">
          <span>掲載元更新日：{entry.team.source.updated.replaceAll("-", "/")}</span>
          <span>確認日：{entry.team.source.checked.replaceAll("-", "/")}</span>
          <a href={entry.team.source.url} target="_blank" rel="noreferrer">{entry.team.source.title}で攻略を確認 ↗</a>
        </div>
      </article>;
    })}
  </section>;
}
