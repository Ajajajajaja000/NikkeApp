import type { CharacterSummary, CoreDustState, NikkeRecord } from "../types";
import { calculateCoreDust, effectiveLevel, growthShortages } from "../rules/growth";

interface Props {
  catalog: CharacterSummary[];
  records: Record<string, NikkeRecord>;
  coreDust: CoreDustState;
  lastBlablaImport?: string;
  onCoreDustChange: (value: CoreDustState) => void;
  goNikkes: () => void;
}

const number = new Intl.NumberFormat("ja-JP");

export function HomePage({ catalog, records, coreDust, lastBlablaImport, onCoreDustChange, goNikkes }: Props) {
  const owned = catalog.filter((character) => records[character.id]?.owned);
  const favorites = catalog.filter((character) => records[character.id]?.favorite).sort((a, b) => growthShortages(records[b.id]).length - growthShortages(records[a.id]).length);
  const calc = calculateCoreDust(coreDust);
  const set = (patch: Partial<CoreDustState>) => onCoreDustChange({ ...coreDust, ...patch });
  const setCase = (key: keyof CoreDustState["cases"], value: number) => set({ cases: { ...coreDust.cases, [key]: value } });

  return <section className="page">
    <header className="hero compact">
      <div><p className="eyebrow">LOCAL COMMAND CENTER</p><h1>育成ダッシュボード</h1><p>この端末だけに保存。通信が止まっても記録は残ります。</p></div>
      <div className="hero-stat"><strong>{owned.length}</strong><span>所持</span></div>
    </header>
    <p className="blabla-date">BlablaLinkからデータ取り込み日時：{lastBlablaImport ? new Date(lastBlablaImport).toLocaleString("ja-JP") : "未取得"}</p>

    <div className="section-heading"><div><p className="eyebrow">PRIORITY</p><h2>育成対象</h2></div><button className="text-button" onClick={goNikkes}>ニケ一覧へ</button></div>
    {favorites.length === 0 ? <div className="empty-state"><span>☆</span><h3>育成対象はまだありません</h3><p>ニケ一覧で「育成」をオンにすると、不足をここで追跡できます。</p><button className="primary" onClick={goNikkes}>ニケを選ぶ</button></div> :
      <div className="growth-grid">{favorites.map((character, index) => {
        const record = records[character.id];
        const shortages = growthShortages(record);
        return <article className="growth-card" key={character.id}>
          <div className="rank">{String(index + 1).padStart(2, "0")}</div>
          <div><h3>{character.name}</h3><p className="muted">Lv.{effectiveLevel(record)} · {character.element} · B{character.bursts.join("/") || "?"}</p></div>
          <div className="shortage-list">{shortages.length ? shortages.map((item) => <span key={item}>{item}</span>) : <span className="complete">目標達成</span>}</div>
        </article>;
      })}</div>}

    <div className="section-heading"><div><p className="eyebrow">CORE DUST</p><h2>コアダスト計算</h2></div></div>
    <article className="panel dust-panel">
      <div className="form-grid two">
        <label>現在シンクロLv<input type="number" min="200" max="999" value={coreDust.currentLevel} onChange={(e) => set({ currentLevel: Number(e.target.value) })} /></label>
        <label>目標Lv<input type="number" min="201" max="999" value={coreDust.targetLevel} onChange={(e) => set({ targetLevel: Number(e.target.value) })} /></label>
        <label>現在所持<input type="number" min="0" value={coreDust.currentDust} onChange={(e) => set({ currentDust: Number(e.target.value) })} /></label>
        <label>基地の1時間獲得量<input type="number" min="0" step="0.01" value={coreDust.hourlyRate} onChange={(e) => set({ hourlyRate: Number(e.target.value) })} /></label>
      </div>
      <h3>時間ケース所持数</h3>
      <div className="case-grid">{([1, 2, 8, 12, 24] as const).map((hours) => {
        const key = `h${hours}` as keyof CoreDustState["cases"];
        return <label key={hours}>{hours}h<input type="number" min="0" value={coreDust.cases[key]} onChange={(e) => setCase(key, Number(e.target.value))} /></label>;
      })}</div>
      <div className="result-grid">
        <div><span>必要数</span><strong>{number.format(calc.required)}</strong></div>
        <div><span>ケース込み</span><strong>{number.format(calc.available)}</strong></div>
        <div className={calc.shortage ? "warn" : "ok"}><span>{calc.shortage ? "不足" : "余剰"}</span><strong>{number.format(calc.shortage || calc.available - calc.required)}</strong></div>
      </div>
      <p className="muted">ケース合計 {number.format(calc.caseHours)}時間{calc.days !== null && calc.shortage > 0 ? ` · 基地のみなら約${calc.days.toFixed(1)}日` : ""}。Lv200超の公開必要量表に基づく概算です。</p>
    </article>
  </section>;
}
