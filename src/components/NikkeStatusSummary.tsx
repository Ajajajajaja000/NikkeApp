import type { GearSlot, NikkeRecord } from "../types";
import { effectiveCollection, effectiveCube, effectiveGear, effectiveLevel, effectiveLimitBreak, effectiveSkills } from "../rules/growth";

const slots: Array<{ id: GearSlot; label: string }> = [
  { id: "head", label: "頭" },
  { id: "chest", label: "胴" },
  { id: "arms", label: "腕" },
  { id: "legs", label: "足" },
];

function limitBreakLabel(value: number) {
  return value <= 3 ? `${value}凸` : `コア${value - 3}`;
}

export function NikkeStatusSummary({ record }: { record: NikkeRecord }) {
  if (!record.imported) return <div className="import-missing">BlablaLinkから現在値をまだ取得していません。設定画面から取り込むと、育成・装備・オバロを表示します。</div>;

  const skills = effectiveSkills(record);
  const cube = effectiveCube(record);
  const collection = effectiveCollection(record);

  return <div className="status-summary">
    <div className="status-overview">
      <span><small>レベル</small><strong>Lv.{effectiveLevel(record)}</strong></span>
      <span><small>凸・コア</small><strong>{limitBreakLabel(effectiveLimitBreak(record))}</strong></span>
      <span><small>スキル</small><strong>{skills.join(" / ")}</strong></span>
      <span><small>キューブ</small><strong>{cube.name} Lv.{cube.level}</strong>{cube.id && <small>ID {cube.id}</small>}</span>
      <span><small>コレクション</small><strong>{collection.rarity} Lv.{collection.level}</strong><small>{collection.treasure ? "宝もの解放済み" : collection.name || "未設定"}{collection.id ? ` · ID ${collection.id}` : ""}</small></span>
    </div>

    <div className="equipment-grid" aria-label="装備・オーバーロード状況">
      {slots.map((slot) => {
        const gear = effectiveGear(record, slot.id);
        return <section className={`equipment-card ${gear.overload ? "overloaded" : ""}`} key={slot.id}>
          <div className="equipment-head"><strong>{slot.label}</strong><span>{gear.tier} · Lv.{gear.level}</span>{gear.overload && <b>OL</b>}</div>
          <p>{gear.name || "装備情報なし"}</p>
          <small>{gear.corporation || "企業不明"}{gear.id ? ` · ID ${gear.id}` : ""}</small>
          {gear.options?.length ? <ul className="overload-options">{gear.options.map((option, index) => <li key={`${option.id ?? option.name}-${index}`}>
            <span>{option.name}</span><strong>ランク{option.rank ?? "?"}{option.value !== undefined ? ` · ${option.value}${option.unit ?? ""}` : ""}</strong>
          </li>)}</ul> : <p className="no-options">オバロ効果なし</p>}
        </section>;
      })}
    </div>
  </div>;
}
