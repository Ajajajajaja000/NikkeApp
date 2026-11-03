import { useEffect, useMemo, useRef, useState } from "react";
import type { CharacterDetail, CharacterSummary, NikkeRecord } from "../types";
import { NikkeEditor } from "../components/NikkeEditor";
import { emptyRecord, mergeRecord } from "../storage";
import { fetchCharacterDetail } from "../api/nikkeApi";
import { filterCharacters } from "../rules/filterCharacters";

export interface NikkeFilters {
  query: string;
  owned: "all" | "owned" | "unowned";
  element: string;
  corporation: string;
  weapon: string;
  burst: "all" | "I" | "II" | "III";
}

interface Props {
  catalog: CharacterSummary[];
  records: Record<string, NikkeRecord>;
  filters: NikkeFilters;
  initialOpenId?: string;
  onFiltersChange: (filters: NikkeFilters) => void;
  onClearFocus: () => void;
  onRecordChange: (id: string, record: NikkeRecord) => void;
}

export function NikkePage({ catalog, records, filters, initialOpenId, onFiltersChange, onClearFocus, onRecordChange }: Props) {
  const [openId, setOpenId] = useState(initialOpenId ?? "");
  const [limit, setLimit] = useState(40);
  const [details, setDetails] = useState<Record<string, CharacterDetail>>({});
  const [detailState, setDetailState] = useState<{ id: string; error?: string } | null>(null);
  const detailRequests = useRef(new Set<string>());

  const options = (key: "element" | "corporation" | "weapon") => [...new Set(catalog.map((item) => item[key]).filter(Boolean))].sort();
  const filtered = useMemo(() => filterCharacters(catalog, records, {
    ...filters,
  }), [catalog, records, filters]);
  const focusedCharacter = initialOpenId ? catalog.find((character) => character.id === initialOpenId) : undefined;
  const visibleCharacters = focusedCharacter ? [focusedCharacter, ...filtered.filter((character) => character.id !== focusedCharacter.id)] : filtered;

  const loadDetail = async (character: CharacterSummary) => {
    if (details[character.id] || character.source === "fallback" || detailRequests.current.has(character.id)) return;
    detailRequests.current.add(character.id);
    setDetailState({ id: character.id });
    try {
      const detail = await fetchCharacterDetail(character.id);
      setDetails((current) => ({ ...current, [character.id]: detail }));
      setDetailState(null);
    } catch (error) {
      setDetailState({ id: character.id, error: error instanceof Error ? error.message : "詳細を取得できませんでした。" });
    } finally { detailRequests.current.delete(character.id); }
  };
  const toggleOpen = async (character: CharacterSummary) => {
    if (openId === character.id) { setOpenId(""); return; }
    setOpenId(character.id);
    await loadDetail(character);
  };
  useEffect(() => {
    if (!focusedCharacter) return;
    setOpenId(focusedCharacter.id);
    void loadDetail(focusedCharacter);
    requestAnimationFrame(() => document.getElementById(`nikke-${focusedCharacter.id}`)?.scrollIntoView({ block: "start" }));
    // 育成対象から遷移したIDが変わった時だけ、対象の詳細を開く。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedCharacter?.id]);
  const setFilter = (patch: Partial<NikkeFilters>) => {
    onClearFocus();
    onFiltersChange({ ...filters, ...patch });
  };
  const update = (character: CharacterSummary, patch: Partial<NikkeRecord>) => onRecordChange(character.id, mergeRecord(records[character.id], { ...patch, displayName: character.name }));

  return <section className="page">
    <div className="page-title"><p className="eyebrow">ROSTER</p><h1>ニケ一覧</h1><p>{filtered.length} / {catalog.length}体を実装が新しい順で表示{focusedCharacter ? ` · ${focusedCharacter.name}を先頭表示` : ""}</p></div>
    <div className="filter-panel">
      <label className="search"><span aria-hidden="true">⌕</span><input type="search" placeholder="日本語名で検索" value={filters.query} onChange={(e) => { setFilter({ query: e.target.value }); setLimit(40); }} /></label>
      <div className="filters">
        <select aria-label="所持状態" value={filters.owned} onChange={(e) => setFilter({ owned: e.target.value as NikkeFilters["owned"] })}><option value="all">所持：すべて</option><option value="owned">所持のみ</option><option value="unowned">未所持のみ</option></select>
        <select aria-label="属性" value={filters.element} onChange={(e) => setFilter({ element: e.target.value })}><option value="all">属性：すべて</option>{options("element").map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="企業" value={filters.corporation} onChange={(e) => setFilter({ corporation: e.target.value })}><option value="all">企業：すべて</option>{options("corporation").map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="武器" value={filters.weapon} onChange={(e) => setFilter({ weapon: e.target.value })}><option value="all">武器：すべて</option>{options("weapon").map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="バースト" value={filters.burst} onChange={(e) => setFilter({ burst: e.target.value as NikkeFilters["burst"] })}><option value="all">バースト：すべて</option><option value="I">Ⅰ</option><option value="II">Ⅱ</option><option value="III">Ⅲ</option></select>
      </div>
    </div>
    <div className="roster-list">{visibleCharacters.slice(0, limit).map((character) => {
      const record = records[character.id] ?? emptyRecord();
      const isOpen = openId === character.id;
      return <article id={`nikke-${character.id}`} className={`nikke-card ${record.owned ? "owned" : ""}`} key={character.id}>
        <div className="nikke-summary" onClick={() => toggleOpen(character)}>
          <div className="avatar">{character.icon ? <img src={character.icon} alt="" loading="lazy" /> : <span>{character.name.slice(0, 1)}</span>}</div>
          <div className="nikke-main"><h3>{character.name}</h3><p>{character.element || "属性不明"} · {character.corporation || "企業不明"} · {character.weapon || "武器不明"}</p><div className="chips"><span>B{character.bursts.join("/") || "?"}</span><span>{character.class}</span><span>ID {character.id}</span></div></div>
          <div className="card-actions">
            <button className={`growth-toggle ${record.favorite ? "selected" : ""}`} aria-label={`${character.name}をホームの育成対象に${record.favorite ? "表示中" : "追加"}`} title="ホームの育成対象に表示" onClick={(e) => { e.stopPropagation(); update(character, { favorite: !record.favorite }); }}>{record.favorite ? "育成対象中" : "育成対象にする"}</button>
            <button className={`owned-button ${record.owned ? "selected" : ""}`} onClick={(e) => { e.stopPropagation(); update(character, { owned: !record.owned }); }}>{record.owned ? "所持" : "未所持"}</button>
          </div>
        </div>
        {isOpen && <NikkeEditor character={character} record={record} detail={details[character.id]} detailLoading={detailState?.id === character.id && !detailState.error} detailError={detailState?.id === character.id ? detailState.error : undefined} onChange={(next) => onRecordChange(character.id, next)} />}
      </article>;
    })}</div>
    {visibleCharacters.length > limit && <button className="load-more" onClick={() => setLimit((value) => value + 40)}>さらに40体表示</button>}
    {visibleCharacters.length === 0 && <div className="empty-state"><span>⌕</span><h3>該当するニケがいません</h3><p>検索語か絞り込みを変更してください。</p></div>}
  </section>;
}
