import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { BlablaConnection, CharacterSummary, NikkeRecord } from "./types";
import { BottomNav, type PageId } from "./components/BottomNav";
import { HomePage } from "./pages/HomePage";
import { NikkePage } from "./pages/NikkePage";
import { TeamsPage } from "./pages/TeamsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { fallbackCharacters } from "./data/fallback";
import { blablaErrorMessage, extractBlablaId, fetchCatalog, importBlablaRoster, mergeImportedRecord } from "./api/nikkeApi";
import { useAppData } from "./hooks/useAppData";
import { clearConnection, createConnection, loadConnection, saveConnection, shouldAutoSync } from "./blablaConnection";

export default function App() {
  const [page, setPage] = useState<PageId>("home");
  const { data, setData, saveError } = useAppData();
  const [remoteCatalog, setRemoteCatalog] = useState<CharacterSummary[]>([]);
  const [catalogStatus, setCatalogStatus] = useState("APIへ接続しています…");
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [connection, setConnectionState] = useState<BlablaConnection | null>(() => loadConnection());
  const [syncState, setSyncState] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const syncing = useRef(false);

  const setConnection = useCallback((next: BlablaConnection | null) => {
    setConnectionState(next);
    if (next) saveConnection(next); else clearConnection();
  }, []);

  const refresh = useCallback(() => setRefreshTick((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setCatalogLoading(true);
    setCatalogStatus("APIへ接続しています…");
    fetchCatalog(controller.signal).then((characters) => {
      setRemoteCatalog(characters);
      const fetchedAt = new Date().toISOString();
      setData((current) => ({ ...current, catalogMeta: { fetchedAt, source: "非公式NIKKE API", count: characters.length } }));
      setCatalogStatus(`非公式NIKKE APIから${characters.length}体を取得しました。`);
    }).catch((error) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setCatalogStatus(`APIに接続できません。保存済み記録と内蔵最小データで継続します。${error instanceof Error ? `（${error.message}）` : ""}`);
    }).finally(() => setCatalogLoading(false));
    return () => controller.abort();
  }, [refreshTick, setData]);

  const catalog = useMemo(() => {
    const base = remoteCatalog.length ? remoteCatalog : fallbackCharacters;
    const known = new Set(base.map((character) => character.id));
    const orphans: CharacterSummary[] = Object.entries(data.profile.records).filter(([id, record]) => !known.has(id) && record.displayName).map(([id, record]) => ({ id, name: record.displayName!, rarity: "", class: "", bursts: [], corporation: "", element: "", weapon: "", source: "fallback" }));
    return [...base, ...orphans];
  }, [remoteCatalog, data.profile.records]);

  const syncBlabla = useCallback(async (openid = connection?.openid, baseConnection = connection) => {
    if (!openid || syncing.current) return false;
    if (remoteCatalog.length === 0) {
      setSyncState("キャラ図鑑の取得が完了していないため取り込めません。通信状態を確認して、マスターデータを手動更新してください。");
      return false;
    }
    syncing.current = true;
    setIsSyncing(true);
    const attemptedAt = new Date().toISOString();
    const active = baseConnection ?? createConnection(openid);
    setConnection({ ...active, openid, lastAttemptAt: attemptedAt });
    setSyncState("BlablaLinkから詳細データを取得中…");
    try {
      const imported = await importBlablaRoster(openid, active.area);
      if (active.lastCount && imported.rows.length < active.lastCount * 0.6) throw new Error("前回より取得件数が大幅に少ないため、データを更新しませんでした。");
      const matches = imported.rows.map((row) => ({ row, character: remoteCatalog.find((item) => item.resourceId === row.resourceId) })).filter((item) => item.character);
      if (matches.length < imported.rows.length * 0.8) throw new Error(`図鑑IDとの照合が不足しています（${matches.length}/${imported.rows.length}体）。保存済みデータは変更していません。`);
      setData((current) => {
        const records = { ...current.profile.records };
        for (const { row, character } of matches) if (character) records[character.id] = { ...mergeImportedRecord(records[character.id], row.snapshot), displayName: character.name };
        return { ...current, blablaMeta: { fetchedAt: imported.fetchedAt, source: "BlablaLink公開プロフィール / 非公式NIKKE API", count: matches.length }, profile: { ...current.profile, records } };
      });
      const next = { ...active, openid, area: imported.area, lastAttemptAt: attemptedAt, lastSuccessAt: imported.fetchedAt, lastCount: matches.length, lastError: undefined };
      setConnection(next);
      setSyncState(`${matches.length}体を取り込みました。手入力値は変更していません。`);
      return true;
    } catch (error) {
      const message = blablaErrorMessage(error);
      setConnection({ ...active, openid, lastAttemptAt: attemptedAt, lastError: message });
      setSyncState(message);
      return false;
    } finally { syncing.current = false; setIsSyncing(false); }
  }, [connection, remoteCatalog, setConnection, setData]);

  const connectBlabla = useCallback(async (link: string) => {
    if (syncing.current) return;
    const openid = extractBlablaId(link);
    const next = createConnection(openid);
    setConnection(next);
    const succeeded = await syncBlabla(openid, next);
    // 初回に失敗した接続を「接続済み」と見せず、URL入力からやり直せる状態へ戻す。
    if (!succeeded) setConnection(null);
  }, [setConnection, syncBlabla]);

  useEffect(() => {
    const check = () => { if (document.visibilityState === "visible" && shouldAutoSync(connection)) void syncBlabla(); };
    check();
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, [connection, syncBlabla]);

  const updateRecord = (id: string, record: NikkeRecord) => setData((current) => ({ ...current, profile: { ...current.profile, records: { ...current.profile.records, [id]: record } } }));
  const content = page === "home" ? <HomePage catalog={catalog} records={data.profile.records} coreDust={data.profile.coreDust} lastBlablaImport={data.blablaMeta?.fetchedAt} onCoreDustChange={(coreDust) => setData((current) => ({ ...current, profile: { ...current.profile, coreDust } }))} goNikkes={() => setPage("nikkes")} />
    : page === "nikkes" ? <NikkePage catalog={catalog} records={data.profile.records} onRecordChange={updateRecord} />
    : page === "teams" ? <TeamsPage catalog={catalog} records={data.profile.records} savedTeams={data.profile.savedTeams} onSavedTeamsChange={(savedTeams) => setData((current) => ({ ...current, profile: { ...current.profile, savedTeams } }))} />
    : <SettingsPage data={data} catalog={catalog} catalogStatus={catalogStatus} catalogLoading={catalogLoading} connection={connection} syncState={syncState} isSyncing={isSyncing} onConnect={connectBlabla} onSync={() => syncBlabla()} onConnectionChange={setConnection} onDataChange={setData} onRefresh={refresh} />;

  return <div className="app-shell">
    <div className="top-accent" />
    <main>{content}</main>
    {saveError && <div className="save-error" role="alert">{saveError}</div>}
    <BottomNav page={page} onChange={setPage} />
  </div>;
}
