import type { GearSlot, NikkeRecord, OverloadTarget } from "../types";
import { effectiveCollection, effectiveCube, effectiveGear, effectiveLevel, effectiveLimitBreak, effectiveSkills } from "../rules/growth";
import { optionMatchesTargets, overloadRollStyle } from "../rules/overload";

const slots: Array<{ id: GearSlot; label: string }> = [
  { id: "head", label: "頭" },
  { id: "chest", label: "胴" },
  { id: "arms", label: "腕" },
  { id: "legs", label: "足" },
];

function limitBreakLabel(value: number) {
  return value <= 3 ? `${value}凸` : `コア${value - 3}`;
}

export function NikkeStatusSummary({ record, overloadTargets = [] }: { record: NikkeRecord; overloadTargets?: OverloadTarget[] }) {
  if (!record.imported) return <div className="import-missing">BlablaLinkから現在値をまだ取得していません。設定画面から取り込むと、育成・装備・オバロを表示します。</div>;

  const skills = effectiveSkills(record);
  const cube = effectiveCube(record);
  const collection = effectiveCollection(record);

  return <div className="status-summary">
    <div className="status-overview">
      <span><small>レベル</small><strong>Lv.{effectiveLevel(record)}</strong></span>
      <span><small>凸・コア</small><strong>{limitBreakLabel(effectiveLimitBreak(record))}</strong></span>
      <span><small>スキル</small><strong>{skills.join(" / ")}</strong></span>
      <span><small>キューブ</small><strong>{cube.name} Lv.{cube.level}</strong></span>
      <span><small>コレクション</small><strong>{collection.rarity} Lv.{collection.level}</strong><small>{collection.treasure ? "宝もの解放済み" : "宝もの未解放"}</small></span>
    </div>

    <div className="equipment-grid" aria-label="装備・オーバーロード状況">
      {slots.map((slot) => {
        const gear = effectiveGear(record, slot.id);
        return <section className={`equipment-card ${gear.overload ? "overloaded" : ""}`} key={slot.id}>
          <div className="equipment-head"><strong>{slot.label}</strong><span>{gear.tier} · Lv.{gear.level}</span>{gear.overload && <b>OL</b>}</div>
          {gear.options?.length ? <ul className="overload-options">{gear.options.map((option, index) => {
            const style = overloadRollStyle(option.rank);
            const matchesGoal = optionMatchesTargets(option.name, overloadTargets);
            return <li className={`roll-${style} ${matchesGoal ? "goal-match" : ""}`} key={`${option.id ?? option.name}-${index}`}>
              <div><span>{option.name}</span>{matchesGoal && <b className="goal-match-badge">目標一致</b>}{style === "blue" && <b>青字</b>}{style === "black" && <b>黒帯</b>}</div>
              <strong>{option.value !== undefined ? `${option.value}${option.unit ?? ""}` : "数値不明"}<small>ランク{option.rank ?? "?"}</small></strong>
            </li>;
          })}</ul> : <p className="no-options">オバロ効果なし</p>}
        </section>;
      })}
    </div>
  </div>;
}
