import type { CharacterSummary, NikkeRecord } from "../types";
import { effectiveCollection, effectiveLevel, growthStatus } from "../rules/growth";
import { NikkeStatusSummary } from "../components/NikkeStatusSummary";
import { growthRecommendation } from "../data/growthRecommendations";
import { overloadRecommendation } from "../data/overloadRecommendations";
import { effectiveOverloadTargets } from "../rules/overload";
import { burstLabel, elementLabel } from "../presentation/labels";

interface Props {
  catalog: CharacterSummary[];
  records: Record<string, NikkeRecord>;
  lastBlablaImport?: string;
  goNikkes: (characterId?: string) => void;
}

export function HomePage({ catalog, records, lastBlablaImport, goNikkes }: Props) {
  const owned = catalog.filter((character) => records[character.id]?.owned);
  const favorites = catalog
    .filter((character) => records[character.id]?.favorite)
    .sort((a, b) => growthStatus(records[b.id], growthRecommendation(b.resourceId)?.skills, overloadRecommendation(b.resourceId, b.name, effectiveCollection(records[b.id]).treasure)).length - growthStatus(records[a.id], growthRecommendation(a.resourceId)?.skills, overloadRecommendation(a.resourceId, a.name, effectiveCollection(records[a.id]).treasure)).length);

  return <section className="page">
    <header className="hero compact">
      <div><p className="eyebrow">LOCAL COMMAND CENTER</p><h1>育成ダッシュボード</h1><p>この端末だけに保存。通信が止まっても記録は残ります。</p></div>
      <div className="hero-stat"><strong>{owned.length}</strong><span>所持</span></div>
    </header>
    <p className="blabla-date">BlablaLinkからデータ取り込み日時：{lastBlablaImport ? new Date(lastBlablaImport).toLocaleString("ja-JP") : "未取得"}</p>

    <div className="section-heading"><div><p className="eyebrow">PRIORITY</p><h2>育成対象</h2></div><button className="text-button" onClick={() => goNikkes()}>ニケ一覧へ</button></div>
    {favorites.length === 0 ? <div className="empty-state"><span>◎</span><h3>育成対象はまだありません</h3><p>ニケ一覧で「育成対象にする」を押すと、不足と詳細をここで追跡できます。</p><button className="primary" onClick={() => goNikkes()}>ニケを選ぶ</button></div> :
      <div className="growth-grid">{favorites.map((character, index) => {
        const record = records[character.id];
        const overload = overloadRecommendation(character.resourceId, character.name, effectiveCollection(record).treasure);
        const shortages = record.imported ? growthStatus(record, growthRecommendation(character.resourceId)?.skills, overload) : ["BlablaLink未取込"];
        const overloadTargets = effectiveOverloadTargets(record, overload);
        return <article className="growth-card" key={character.id}>
          <div className="rank">{String(index + 1).padStart(2, "0")}</div>
          <div><h3>{character.name}</h3><p className="muted">Lv.{effectiveLevel(record)} · {elementLabel(character.element)} · {burstLabel(character.bursts)}</p></div>
          <div className="shortage-list">{shortages.length ? shortages.map((item) => <span key={item}>{item}</span>) : <span className="complete">目標達成</span>}</div>
          <button className="secondary growth-open-button" onClick={() => goNikkes(character.id)}>ニケ一覧で詳細を見る</button>
          <details className="growth-details"><summary>育成状況・装備・オバロを表示</summary><NikkeStatusSummary record={record} overloadTargets={overloadTargets} /></details>
        </article>;
      })}</div>}
  </section>;
}
