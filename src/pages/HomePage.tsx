import type { CharacterSummary, NikkeRecord } from "../types";
import { effectiveLevel, growthShortages } from "../rules/growth";
import { NikkeStatusSummary } from "../components/NikkeStatusSummary";

interface Props {
  catalog: CharacterSummary[];
  records: Record<string, NikkeRecord>;
  lastBlablaImport?: string;
  goNikkes: () => void;
}

export function HomePage({ catalog, records, lastBlablaImport, goNikkes }: Props) {
  const owned = catalog.filter((character) => records[character.id]?.owned);
  const favorites = catalog
    .filter((character) => records[character.id]?.favorite)
    .sort((a, b) => growthShortages(records[b.id]).length - growthShortages(records[a.id]).length);

  return <section className="page">
    <header className="hero compact">
      <div><p className="eyebrow">LOCAL COMMAND CENTER</p><h1>育成ダッシュボード</h1><p>この端末だけに保存。通信が止まっても記録は残ります。</p></div>
      <div className="hero-stat"><strong>{owned.length}</strong><span>所持</span></div>
    </header>
    <p className="blabla-date">BlablaLinkからデータ取り込み日時：{lastBlablaImport ? new Date(lastBlablaImport).toLocaleString("ja-JP") : "未取得"}</p>

    <div className="section-heading"><div><p className="eyebrow">PRIORITY</p><h2>育成対象</h2></div><button className="text-button" onClick={goNikkes}>ニケ一覧へ</button></div>
    {favorites.length === 0 ? <div className="empty-state"><span>◎</span><h3>育成対象はまだありません</h3><p>ニケ一覧で「育成対象にする」を押すと、不足と詳細をここで追跡できます。</p><button className="primary" onClick={goNikkes}>ニケを選ぶ</button></div> :
      <div className="growth-grid">{favorites.map((character, index) => {
        const record = records[character.id];
        const shortages = record.imported ? growthShortages(record) : ["BlablaLink未取込"];
        return <article className="growth-card" key={character.id}>
          <div className="rank">{String(index + 1).padStart(2, "0")}</div>
          <div><h3>{character.name}</h3><p className="muted">Lv.{effectiveLevel(record)} · {character.element} · B{character.bursts.join("/") || "?"}</p></div>
          <div className="shortage-list">{shortages.length ? shortages.map((item) => <span key={item}>{item}</span>) : <span className="complete">目標達成</span>}</div>
          <details className="growth-details"><summary>育成状況・装備・オバロを表示</summary><NikkeStatusSummary record={record} /></details>
        </article>;
      })}</div>}
  </section>;
}
