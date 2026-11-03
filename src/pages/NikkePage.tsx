import { useMemo, useState } from "react";
import type { CharacterDetail, CharacterSummary, NikkeRecord } from "../types";
import { NikkeEditor } from "../components/NikkeEditor";
import { emptyRecord, mergeRecord } from "../storage";
import { fetchCharacterDetail } from "../api/nikkeApi";
import { filterCharacters } from "../rules/filterCharacters";

interface Props { catalog: CharacterSummary[]; records: Record<string, NikkeRecord>; onRecordChange: (id: string, record: NikkeRecord) => void; }

export function NikkePage({ catalog, records, onRecordChange }: Props) {
  const [query, setQuery] = useState("");
  const [owned, setOwned] = useState("all");
  const [element, setElement] = useState("all");
  const [corporation, setCorporation] = useState("all");
  const [weapon, setWeapon] = useState("all");
  const [burst, setBurst] = useState("all");
  const [openId, setOpenId] = useState("");
  const [limit, setLimit] = useState(40);
  const [details, setDetails] = useState<Record<string, CharacterDetail>>({});
  const [detailState, setDetailState] = useState<{ id: string; error?: string } | null>(null);

  const options = (key: "element" | "corporation" | "weapon") => [...new Set(catalog.map((item) => item[key]).filter(Boolean))].sort();
  const filtered = useMemo(() => filterCharacters(catalog, records, {
    query,
    owned: owned as "all" | "owned" | "unowned",
    element,
    corporation,
    weapon,
    burst: burst as "all" | "I" | "II" | "III",
  }), [catalog, records, query, owned, element, corporation, weapon, burst]);

  const toggleOpen = async (character: CharacterSummary) => {
    if (openId === character.id) { setOpenId(""); return; }
    setOpenId(character.id);
    if (details[character.id] || character.source === "fallback") return;
    setDetailState({ id: character.id });
    try {
      const detail = await fetchCharacterDetail(character.id);
      setDetails((current) => ({ ...current, [character.id]: detail }));
      setDetailState(null);
    } catch (error) {
      setDetailState({ id: character.id, error: error instanceof Error ? error.message : "詳細を取得できませんでした。" });
    }
  };
  const update = (character: CharacterSummary, patch: Partial<NikkeRecord>) => onRecordChange(character.id, mergeRecord(records[character.id], { ...patch, displayName: character.name }));

  return <section className="page">
    <div className="page-title"><p className="eyebrow">ROSTER</p><h1>ニケ一覧</h1><p>{filtered.length} / {catalog.length}体を表示</p></div>
    <div className="filter-panel">
      <label className="search"><span aria-hidden="true">⌕</span><input type="search" placeholder="日本語名で検索" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(40); }} /></label>
      <div className="filters">
        <select aria-label="所持状態" value={owned} onChange={(e) => setOwned(e.target.value)}><option value="all">所持：すべて</option><option value="owned">所持のみ</option><option value="unowned">未所持のみ</option></select>
        <select aria-label="属性" value={element} onChange={(e) => setElement(e.target.value)}><option value="all">属性：すべて</option>{options("element").map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="企業" value={corporation} onChange={(e) => setCorporation(e.target.value)}><option value="all">企業：すべて</option>{options("corporation").map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="武器" value={weapon} onChange={(e) => setWeapon(e.target.value)}><option value="all">武器：すべて</option>{options("weapon").map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="バースト" value={burst} onChange={(e) => setBurst(e.target.value)}><option value="all">バースト：すべて</option><option value="I">Ⅰ</option><option value="II">Ⅱ</option><option value="III">Ⅲ</option></select>
      </div>
    </div>
    <div className="roster-list">{filtered.slice(0, limit).map((character) => {
      const record = records[character.id] ?? emptyRecord();
      const isOpen = openId === character.id;
      return <article className={`nikke-card ${record.owned ? "owned" : ""}`} key={character.id}>
        <div className="nikke-summary" onClick={() => toggleOpen(character)}>
          <div className="avatar">{character.icon ? <img src={character.icon} alt="" loading="lazy" /> : <span>{character.name.slice(0, 1)}</span>}</div>
          <div className="nikke-main"><h3>{character.name}</h3><p>{character.element || "属性不明"} · {character.corporation || "企業不明"} · {character.weapon || "武器不明"}</p><div className="chips"><span>B{character.bursts.join("/") || "?"}</span><span>{character.class}</span><span>ID {character.id}</span></div></div>
          <div className="card-actions">
            <button className={`icon-button ${record.favorite ? "selected" : ""}`} aria-label="育成対象" title="育成対象" onClick={(e) => { e.stopPropagation(); update(character, { favorite: !record.favorite }); }}>☆</button>
            <button className={`owned-button ${record.owned ? "selected" : ""}`} onClick={(e) => { e.stopPropagation(); update(character, { owned: !record.owned }); }}>{record.owned ? "所持" : "未所持"}</button>
          </div>
        </div>
        {isOpen && <NikkeEditor character={character} record={record} detail={details[character.id]} detailLoading={detailState?.id === character.id && !detailState.error} detailError={detailState?.id === character.id ? detailState.error : undefined} onChange={(next) => onRecordChange(character.id, next)} />}
      </article>;
    })}</div>
    {filtered.length > limit && <button className="load-more" onClick={() => setLimit((value) => value + 40)}>さらに40体表示</button>}
    {filtered.length === 0 && <div className="empty-state"><span>⌕</span><h3>該当するニケがいません</h3><p>検索語か絞り込みを変更してください。</p></div>}
  </section>;
}
