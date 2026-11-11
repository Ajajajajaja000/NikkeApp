import type { CharacterSummary, GrowthPriority, NikkeRecord } from "../types";
import { compareGrowthPriority, effectiveCollection, effectiveGrowthPriority, effectiveLevel, growthStatus } from "../rules/growth";
import { growthRecommendation } from "../data/growthRecommendations";
import { overloadRecommendation } from "../data/overloadRecommendations";
import { burstLabel, elementLabel } from "../presentation/labels";

interface Props {
  catalog: CharacterSummary[];
  records: Record<string, NikkeRecord>;
  goNikkes: (characterId?: string) => void;
  onRecordChange: (id: string, record: NikkeRecord) => void;
}

const priorityLabels: Record<GrowthPriority, string> = { high: "高", medium: "中", low: "低" };

export function HomePage({ catalog, records, goNikkes, onRecordChange }: Props) {
  const owned = catalog.filter((character) => records[character.id]?.owned);
  const favorites = catalog
    .filter((character) => records[character.id]?.favorite)
    .sort((a, b) => compareGrowthPriority(records[a.id], records[b.id])
      || growthStatus(records[b.id], growthRecommendation(b.resourceId)?.skills, overloadRecommendation(b.resourceId, b.name, effectiveCollection(records[b.id]).treasure)).length
      - growthStatus(records[a.id], growthRecommendation(a.resourceId)?.skills, overloadRecommendation(a.resourceId, a.name, effectiveCollection(records[a.id]).treasure)).length);

  return <section className="page">
    <header className="hero compact">
      <div><p className="eyebrow">LOCAL COMMAND CENTER</p><h1>育成ダッシュボード</h1></div>
      <div className="hero-stat"><strong>{owned.length}</strong><span>所持</span></div>
    </header>

    <div className="section-heading"><div><p className="eyebrow">PRIORITY</p><h2>育成対象</h2></div><button className="text-button" onClick={() => goNikkes()}>ニケ一覧へ</button></div>
    {favorites.length === 0 ? <div className="empty-state"><span>◎</span><h3>育成対象はまだありません</h3><button className="primary" onClick={() => goNikkes()}>ニケを選ぶ</button></div> :
      <div className="growth-grid">{favorites.map((character) => {
        const record = records[character.id];
        const overload = overloadRecommendation(character.resourceId, character.name, effectiveCollection(record).treasure);
        const shortages = record.imported ? growthStatus(record, growthRecommendation(character.resourceId)?.skills, overload) : ["BlablaLink未取込"];
        const visibleShortages = shortages.slice(0, 3);
        return <article className="growth-card" key={character.id}>
          <div className="growth-card-head">
            <label className="growth-priority"><span>優先度</span><select data-priority={effectiveGrowthPriority(record)} aria-label={`${character.name}の育成優先度`} value={effectiveGrowthPriority(record)} onChange={(event) => onRecordChange(character.id, { ...record, growthPriority: event.target.value as GrowthPriority })}>{Object.entries(priorityLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <div className="growth-avatar">{character.icon ? <img src={character.icon} alt="" loading="lazy" /> : <span>{character.name.slice(0, 1)}</span>}</div>
            <div className="growth-card-copy"><h3>{character.name}</h3><p className="muted">Lv.{effectiveLevel(record)} · {elementLabel(character.element)} · {burstLabel(character.bursts)}</p></div>
            <button className="growth-jump" type="button" aria-label={`${character.name}の詳細を見る`} onClick={() => goNikkes(character.id)}>›</button>
          </div>
          <div className="shortage-list">{visibleShortages.length ? visibleShortages.map((item) => <span key={item}>{item}</span>) : <span className="complete">目標達成</span>}{shortages.length > visibleShortages.length && <span>ほか{shortages.length - visibleShortages.length}件</span>}</div>
        </article>;
      })}</div>}
  </section>;
}
