import { useEffect, useState } from "react";
import type { CharacterDetail, CharacterSummary, NikkeRecord } from "../types";
import { fetchCharacterDetail } from "../api/nikkeApi";
import { NikkeEditor } from "../components/NikkeEditor";
import { emptyRecord, mergeRecord } from "../storage";
import { effectiveCombatPower, effectiveLevel } from "../rules/growth";
import { burstLabel, classLabel, corporationLabel, elementLabel, weaponLabel } from "../presentation/labels";

interface Props {
  character: CharacterSummary;
  record?: NikkeRecord;
  onBack: () => void;
  onRecordChange: (id: string, record: NikkeRecord) => void;
}

export function NikkeDetailPage({ character, record, onBack, onRecordChange }: Props) {
  const value = mergeRecord(emptyRecord(), record ?? {});
  const [detail, setDetail] = useState<CharacterDetail>();
  const [detailLoading, setDetailLoading] = useState(character.source !== "fallback");
  const [detailError, setDetailError] = useState<string>();
  const combatPower = effectiveCombatPower(value);

  useEffect(() => {
    setDetail(undefined);
    setDetailError(undefined);
    if (character.source === "fallback") { setDetailLoading(false); return; }
    const controller = new AbortController();
    setDetailLoading(true);
    void fetchCharacterDetail(character.id, controller.signal).then(setDetail).catch((error) => {
      if (!controller.signal.aborted) setDetailError(error instanceof Error ? error.message : "詳細を取得できませんでした。");
    }).finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [character.id, character.source]);

  const update = (patch: Partial<NikkeRecord>) => onRecordChange(character.id, mergeRecord(value, { ...patch, displayName: character.name }));

  return <section className="page nikke-detail-page">
    <button className="detail-back" type="button" onClick={onBack}><span aria-hidden="true">‹</span>一覧へ戻る</button>
    <header className="nikke-detail-header">
      <div className="detail-avatar">{character.icon ? <img src={character.icon} alt="" /> : <span>{character.name.slice(0, 1)}</span>}</div>
      <div className="detail-heading">
        <p className="eyebrow">NIKKE DETAIL</p>
        <h1>{character.name}</h1>
        <p>{elementLabel(character.element)} · {corporationLabel(character.corporation)} · {weaponLabel(character.weapon)}</p>
        <div className="detail-chips"><span>{burstLabel(character.bursts)}</span><span>{classLabel(character.class)}</span></div>
      </div>
      <div className="detail-current">
        <span><small>レベル</small><strong>Lv.{effectiveLevel(value)}</strong></span>
        <span><small>戦闘力</small><strong>{combatPower?.toLocaleString("ja-JP") ?? "未取得"}</strong></span>
      </div>
      <div className="detail-actions">
        <button className={`growth-toggle ${value.favorite ? "selected" : ""}`} type="button" onClick={() => update({ favorite: !value.favorite })}>{value.favorite ? "育成対象中" : "育成対象にする"}</button>
        <button className={`owned-button ${value.owned ? "selected" : ""}`} type="button" onClick={() => update({ owned: !value.owned })}>{value.owned ? "所持" : "未所持"}</button>
      </div>
    </header>
    <NikkeEditor character={character} record={value} detail={detail} detailLoading={detailLoading} detailError={detailError} onChange={(next) => onRecordChange(character.id, next)} />
  </section>;
}
