import type { CharacterDetail, CharacterSummary, GearSlot, NikkeRecord } from "../types";
import { emptyRecord, mergeRecord } from "../storage";
import { effectiveLevel, effectiveLimitBreak, effectiveSkills } from "../rules/growth";

const slots: Array<{ id: GearSlot; label: string }> = [
  { id: "head", label: "頭" }, { id: "chest", label: "胴" }, { id: "arms", label: "腕" }, { id: "legs", label: "足" },
];
const tiers = ["未設定", "T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T9企業", "OL"];

interface Props {
  character: CharacterSummary;
  record?: NikkeRecord;
  detail?: CharacterDetail;
  detailLoading?: boolean;
  detailError?: string;
  onChange: (record: NikkeRecord) => void;
}

export function NikkeEditor({ character, record, detail, detailLoading, detailError, onChange }: Props) {
  const value = mergeRecord(emptyRecord(), record ?? {});
  const skills = effectiveSkills(value);
  const set = (patch: Partial<NikkeRecord>) => onChange({ ...value, ...patch, displayName: character.name, manualUpdatedAt: new Date().toISOString() } as NikkeRecord);
  const setSkill = (index: number, level: number, target = false) => {
    const current = target ? [...(value.target?.skills ?? [7, 7, 7])] : [...skills];
    current[index] = level;
    if (target) set({ target: { ...(value.target ?? { gearTier: "T9", overloadCount: 4, cubeLevel: 7, skills: [7, 7, 7] }), skills: current as [number, number, number] } });
    else set({ skills: current as [number, number, number] });
  };

  return (
    <div className="editor" onClick={(event) => event.stopPropagation()}>
      {value.imported && (
        <div className="source-note">取得値: {new Date(value.imported.fetchedAt).toLocaleString("ja-JP")} / {value.imported.source}。手入力値を優先表示中。</div>
      )}
      <div className="form-grid two">
        <label>レベル<input type="number" min="1" max="999" value={effectiveLevel(value)} onChange={(e) => set({ level: Number(e.target.value) })} /></label>
        <label>凸・コア<select value={effectiveLimitBreak(value)} onChange={(e) => set({ limitBreak: Number(e.target.value) })}>
          {Array.from({ length: 11 }, (_, i) => <option key={i} value={i}>{i <= 3 ? `${i}凸` : `コア${i - 3}`}</option>)}
        </select></label>
      </div>

      <h4>スキル（現在 / 目標）</h4>
      <div className="skill-row">
        {["S1", "S2", "B"].map((label, index) => (
          <label key={label}>{label}<span><input type="number" min="1" max="10" value={skills[index]} onChange={(e) => setSkill(index, Number(e.target.value))} /> / <input type="number" min="1" max="10" value={value.target?.skills[index] ?? 7} onChange={(e) => setSkill(index, Number(e.target.value), true)} /></span></label>
        ))}
      </div>

      <h4>装備</h4>
      <div className="gear-list">
        {slots.map((slot) => {
          const gear = value.gear?.[slot.id] ?? { tier: "未設定", level: 0, overload: false };
          return <div className="gear-row" key={slot.id}><strong>{slot.label}</strong>
            <select aria-label={`${slot.label}装備ランク`} value={gear.tier} onChange={(e) => set({ gear: { ...value.gear!, [slot.id]: { ...gear, tier: e.target.value } } })}>{tiers.map((tier) => <option key={tier}>{tier}</option>)}</select>
            <input aria-label={`${slot.label}装備レベル`} type="number" min="0" max="5" value={gear.level} onChange={(e) => set({ gear: { ...value.gear!, [slot.id]: { ...gear, level: Number(e.target.value) } } })} />
            <label className="check"><input type="checkbox" checked={gear.overload} onChange={(e) => set({ gear: { ...value.gear!, [slot.id]: { ...gear, overload: e.target.checked, tier: e.target.checked ? "OL" : gear.tier } } })} />OL</label>
          </div>;
        })}
      </div>
      <div className="form-grid two">
        <label>装備目標<select value={value.target?.gearTier ?? "T9"} onChange={(e) => set({ target: { ...value.target!, gearTier: e.target.value } })}>{tiers.slice(7).map((tier) => <option key={tier}>{tier}</option>)}</select></label>
        <label>オバロ目標<input type="number" min="0" max="4" value={value.target?.overloadCount ?? 4} onChange={(e) => set({ target: { ...value.target!, overloadCount: Number(e.target.value) } })} /></label>
      </div>

      <h4>キューブ・コレクション</h4>
      <div className="form-grid two">
        <label>キューブ名<input value={value.cube?.name ?? "なし"} onChange={(e) => set({ cube: { ...(value.cube ?? { level: 0 }), name: e.target.value } })} /></label>
        <label>現在 / 目標Lv<span className="inline-inputs"><input type="number" min="0" max="15" value={value.cube?.level ?? 0} onChange={(e) => set({ cube: { ...(value.cube ?? { name: "なし" }), level: Number(e.target.value) } })} /><input type="number" min="0" max="15" value={value.target?.cubeLevel ?? 7} onChange={(e) => set({ target: { ...value.target!, cubeLevel: Number(e.target.value) } })} /></span></label>
        <label>コレクション<select value={value.collection?.rarity ?? "なし"} onChange={(e) => set({ collection: { ...(value.collection ?? { level: 0, treasure: false }), rarity: e.target.value as "なし" | "R" | "SR" | "SSR" } })}>{["なし", "R", "SR", "SSR"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>コレクションLv<input type="number" min="0" max="15" value={value.collection?.level ?? 0} onChange={(e) => set({ collection: { ...(value.collection ?? { rarity: "なし", treasure: false }), level: Number(e.target.value) } })} /></label>
      </div>
      <label className="check wide"><input type="checkbox" checked={value.collection?.treasure ?? false} onChange={(e) => set({ collection: { ...(value.collection ?? { rarity: "なし", level: 0 }), treasure: e.target.checked } })} />宝もの解放済み（通常版・別衣装版のIDは統合しません）</label>
      <label>メモ<textarea rows={2} value={value.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} /></label>

      <h4>API詳細（必要時だけ取得）</h4>
      {detailLoading && <p className="muted">スキル情報を取得中…</p>}
      {detailError && <p className="error-text">{detailError}</p>}
      {detail?.skills.map((skill) => <details className="skill-detail" key={skill.slot}><summary>{skill.name}{skill.cooldown ? ` / CT ${skill.cooldown}秒` : ""}</summary><p>{skill.description}</p></details>)}
    </div>
  );
}
