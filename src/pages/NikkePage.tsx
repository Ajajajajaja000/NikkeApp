import { useMemo, useState } from "react";
import type { CharacterSummary, NikkeRecord } from "../types";
import { emptyRecord, mergeRecord } from "../storage";
import { filterCharacters } from "../rules/filterCharacters";
import { effectiveCombatPower } from "../rules/growth";
import { burstLabel, classLabel, corporationLabel, elementLabel, weaponLabel } from "../presentation/labels";
import { NikkeDetailPage } from "./NikkeDetailPage";

export interface NikkeFilters {
  query: string;
  owned: "all" | "owned" | "unowned";
  element: string;
  corporation: string;
  weapon: string;
  burst: "all" | "I" | "II" | "III";
  sort: "release" | "combat";
}

interface Props {
  catalog: CharacterSummary[];
  records: Record<string, NikkeRecord>;
  filters: NikkeFilters;
  selectedId?: string;
  onFiltersChange: (filters: NikkeFilters) => void;
  onOpenDetail: (id: string) => void;
  onCloseDetail: () => void;
  onRecordChange: (id: string, record: NikkeRecord) => void;
}

export function NikkePage({ catalog, records, filters, selectedId, onFiltersChange, onOpenDetail, onCloseDetail, onRecordChange }: Props) {
  const [limit, setLimit] = useState(40);

  const options = (key: "element" | "corporation" | "weapon") => [...new Set(catalog.map((item) => item[key]).filter(Boolean))].sort();
  const filtered = useMemo(() => filterCharacters(catalog, records, {
    ...filters,
  }), [catalog, records, filters]);
  const selectedCharacter = selectedId ? catalog.find((character) => character.id === selectedId) : undefined;
  const setFilter = (patch: Partial<NikkeFilters>) => {
    onFiltersChange({ ...filters, ...patch });
  };
  const update = (character: CharacterSummary, patch: Partial<NikkeRecord>) => onRecordChange(character.id, mergeRecord(records[character.id], { ...patch, displayName: character.name }));

  if (selectedCharacter) return <NikkeDetailPage character={selectedCharacter} record={records[selectedCharacter.id]} onBack={onCloseDetail} onRecordChange={onRecordChange} />;

  return <section className="page">
    <div className="page-title"><p className="eyebrow">ROSTER</p><h1>ニケ一覧</h1><p>{filtered.length} / {catalog.length}体を{filters.sort === "combat" ? "戦闘力が高い順" : "実装が新しい順"}で表示</p></div>
    <div className="filter-panel">
      <label className="search"><span aria-hidden="true">⌕</span><input type="search" placeholder="日本語名で検索" value={filters.query} onChange={(e) => { setFilter({ query: e.target.value }); setLimit(40); }} /></label>
      <div className="filters">
        <select aria-label="所持状態" value={filters.owned} onChange={(e) => setFilter({ owned: e.target.value as NikkeFilters["owned"] })}><option value="all">所持：すべて</option><option value="owned">所持のみ</option><option value="unowned">未所持のみ</option></select>
        <select aria-label="属性" value={filters.element} onChange={(e) => setFilter({ element: e.target.value })}><option value="all">属性：すべて</option>{options("element").map((item) => <option key={item} value={item}>{elementLabel(item)}</option>)}</select>
        <select aria-label="企業" value={filters.corporation} onChange={(e) => setFilter({ corporation: e.target.value })}><option value="all">企業：すべて</option>{options("corporation").map((item) => <option key={item} value={item}>{corporationLabel(item)}</option>)}</select>
        <select aria-label="武器" value={filters.weapon} onChange={(e) => setFilter({ weapon: e.target.value })}><option value="all">武器：すべて</option>{options("weapon").map((item) => <option key={item} value={item}>{weaponLabel(item)}</option>)}</select>
        <select aria-label="バースト" value={filters.burst} onChange={(e) => setFilter({ burst: e.target.value as NikkeFilters["burst"] })}><option value="all">バースト：すべて</option><option value="I">Ⅰ</option><option value="II">Ⅱ</option><option value="III">Ⅲ</option></select>
        <select aria-label="並び順" value={filters.sort} onChange={(e) => setFilter({ sort: e.target.value as NikkeFilters["sort"] })}><option value="release">並び順：実装順</option><option value="combat">並び順：戦闘力順</option></select>
      </div>
    </div>
    <div className="roster-list">{filtered.slice(0, limit).map((character) => {
      const record = records[character.id] ?? emptyRecord();
      const combatPower = effectiveCombatPower(record);
      const skills = record.imported?.skills;
      const overloadCount = Object.values(record.imported?.gear ?? {}).filter((gear) => gear?.overload).length;
      return <article id={`nikke-${character.id}`} className={`nikke-card ${record.owned ? "owned" : ""}`} key={character.id}>
        <div className="nikke-summary">
          <button className="nikke-open" type="button" aria-label={`${character.name}の詳細を見る`} onClick={() => onOpenDetail(character.id)}>
            <div className="avatar">{character.icon ? <img src={character.icon} alt="" loading="lazy" /> : <span>{character.name.slice(0, 1)}</span>}</div>
            <div className="nikke-main"><h3>{character.name}</h3><p>{elementLabel(character.element)} · {corporationLabel(character.corporation)} · {weaponLabel(character.weapon)}</p><div className="chips"><span>{burstLabel(character.bursts)}</span><span>{classLabel(character.class)}</span>{record.owned && <span className="combat-power">戦闘力 {combatPower?.toLocaleString("ja-JP") ?? "未取得"}</span>}</div>{record.imported && <div className="roster-progress"><span>スキル {skills?.join("/") ?? "未取得"}</span><span>OL {overloadCount}/4</span></div>}</div>
            <span className="nikke-open-arrow" aria-hidden="true">›</span>
          </button>
          <div className="card-actions">
            <button className={`growth-toggle ${record.favorite ? "selected" : ""}`} aria-label={`${character.name}をホームの育成対象に${record.favorite ? "表示中" : "追加"}`} title="ホームの育成対象に表示" onClick={(e) => { e.stopPropagation(); update(character, { favorite: !record.favorite }); }}>{record.favorite ? "育成対象中" : "育成対象にする"}</button>
            <button className={`owned-button ${record.owned ? "selected" : ""}`} onClick={(e) => { e.stopPropagation(); update(character, { owned: !record.owned }); }}>{record.owned ? "所持" : "未所持"}</button>
          </div>
        </div>
      </article>;
    })}</div>
    {filtered.length > limit && <button className="load-more" onClick={() => setLimit((value) => value + 40)}>さらに40体表示</button>}
    {filtered.length === 0 && <div className="empty-state"><span>⌕</span><h3>該当するニケがいません</h3><p>検索語か絞り込みを変更してください。</p></div>}
  </section>;
}
