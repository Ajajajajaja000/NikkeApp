import { useRef, useState } from "react";
import type { AppData, CharacterSummary } from "../types";
import { importBlablaRoster, mergeImportedRecord } from "../api/nikkeApi";
import { createDefaultData, validateImport } from "../storage";
import { sources } from "../data/sources";

interface Props {
  data: AppData;
  catalog: CharacterSummary[];
  catalogStatus: string;
  onDataChange: (data: AppData) => void;
  onRefresh: () => void;
}

export function SettingsPage({ data, catalog, catalogStatus, onDataChange, onRefresh }: Props) {
  const [link, setLink] = useState("");
  const [importState, setImportState] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nikke-compass-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const importFile = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = validateImport(JSON.parse(await file.text()));
      if (!window.confirm(`バックアップでこの端末のデータを上書きします。所持記録 ${Object.keys(parsed.profile.records).length}件。続けますか？`)) return;
      onDataChange(parsed);
      setImportState("バックアップを復元しました。");
    } catch (error) { setImportState(error instanceof Error ? error.message : "読み込めませんでした。"); }
    if (fileRef.current) fileRef.current.value = "";
  };
  const importRoster = async () => {
    setImportState("共有プロフィールを取得中…");
    try {
      const rows = await importBlablaRoster(link);
      const records = { ...data.profile.records };
      let matched = 0;
      for (const row of rows) {
        // ユーザーAPIの内部IDは図鑑IDと異なる場合があるため、日本語名とresourceIdも照合する。
        const character = catalog.find((item) => item.id === row.id || item.resourceId === row.resourceId || (row.name && item.name === row.name));
        if (!character) continue;
        records[character.id] = { ...mergeImportedRecord(records[character.id], row.snapshot), displayName: character.name };
        matched += 1;
      }
      onDataChange({ ...data, profile: { ...data.profile, records } });
      setLink("");
      setImportState(`${matched}体を取り込みました${matched !== rows.length ? `（${rows.length - matched}体は図鑑IDと照合できず除外）` : ""}。手入力値は変更していません。共有リンクは保存していません。`);
    } catch (error) { setImportState(error instanceof Error ? error.message : "取り込みに失敗しました。"); }
  };
  const clear = () => {
    if (!window.confirm("この端末の所持・育成・保存編成をすべて削除します。JSONバックアップは作成しましたか？")) return;
    if (!window.confirm("元に戻せません。本当に全データを削除しますか？")) return;
    onDataChange(createDefaultData());
  };

  return <section className="page">
    <div className="page-title"><p className="eyebrow">CONTROL</p><h1>設定</h1><p>更新・取り込み・バックアップ・出典</p></div>
    <article className="panel"><div className="panel-head"><div><h2>マスターデータ</h2><p>{catalogStatus}</p></div><button className="secondary" onClick={onRefresh}>手動更新</button></div><div className="status-row"><span>現在 {catalog.length}体</span><span>取得元 {data.catalogMeta?.source ?? "内蔵最小データ"}</span><span>取得日時 {data.catalogMeta ? new Date(data.catalogMeta.fetchedAt).toLocaleString("ja-JP") : "未取得"}</span></div></article>

    <article className="panel"><h2>BlablaLinkから所持を取り込む</h2><p>公式BlablaLinkで自分のプロフィールを共有公開し、その共有URLを貼り付けます。パスワード・Cookie・認証トークンは入力しないでください。</p><div className="action-row"><input type="url" placeholder="https://www.blablalink.com/user?openid=…" value={link} onChange={(e) => setLink(e.target.value)} /><button className="primary" onClick={importRoster} disabled={!link.trim()}>取り込む</button></div><p className="muted">リンク自体は保存しません。取得値は別スナップショットとして保存し、既存の手入力を上書きしません。非公開プロフィールは取得できません。</p>{importState && <p className="notice" role="status">{importState}</p>}</article>

    <article className="panel"><h2>バックアップ</h2><p>Safariのサイトデータ削除や別端末への移行に備えて、定期的にJSONを書き出してください。画像・API詳細キャッシュは含みません。</p><div className="button-row"><button className="primary" onClick={exportData}>JSONを書き出す</button><button className="secondary" onClick={() => fileRef.current?.click()}>JSONから復元</button><input ref={fileRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={(e) => importFile(e.target.files?.[0])} /></div><p className="muted">夫婦それぞれの端末で独立保存されます。自動同期・アカウント機能はありません。</p></article>

    <article className="panel"><h2>ホーム画面に追加</h2><p>iPhone Safariの共有メニューから「ホーム画面に追加」を選ぶと、PWAとして全画面に近い形で利用できます。更新が反映されない場合は設定の「手動更新」後に再読み込みしてください。</p></article>

    <article className="panel danger-zone"><h2>データ削除</h2><p>この端末のlocalStorageだけを削除します。API側や他端末には影響しません。</p><button className="danger" onClick={clear}>全データを削除</button></article>

    <div className="section-heading"><div><p className="eyebrow">SOURCES</p><h2>出典・利用条件</h2></div></div>
    <div className="sources">{sources.map((source) => <article className="source-card" key={source.url}><div><h3>{source.title}</h3><span>確認日 {source.checked}</span></div><p>{source.note}</p><a href={source.url} target="_blank" rel="noreferrer">原典を開く ↗</a></article>)}</div>
    <p className="legal">本アプリは個人用・非商用の非公式ファンツールです。『勝利の女神：NIKKE』およびゲーム内素材の権利は SHIFT UP / Level Infinite に帰属します。各外部APIの継続提供は保証されません。</p>
  </section>;
}
