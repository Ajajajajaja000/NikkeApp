import { useCallback, useEffect, useMemo, useState } from "react";
import type { CharacterSummary, NikkeRecord } from "./types";
import { BottomNav, type PageId } from "./components/BottomNav";
import { HomePage } from "./pages/HomePage";
import { NikkePage } from "./pages/NikkePage";
import { TeamsPage } from "./pages/TeamsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { fallbackCharacters } from "./data/fallback";
import { fetchCatalog } from "./api/nikkeApi";
import { useAppData } from "./hooks/useAppData";

export default function App() {
  const [page, setPage] = useState<PageId>("home");
  const { data, setData, saveError } = useAppData();
  const [remoteCatalog, setRemoteCatalog] = useState<CharacterSummary[]>([]);
  const [catalogStatus, setCatalogStatus] = useState("APIへ接続しています…");
  const [refreshTick, setRefreshTick] = useState(0);

  const refresh = useCallback(() => setRefreshTick((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setCatalogStatus("APIへ接続しています…");
    fetchCatalog(controller.signal).then((characters) => {
      setRemoteCatalog(characters);
      const fetchedAt = new Date().toISOString();
      setData((current) => ({ ...current, catalogMeta: { fetchedAt, source: "非公式NIKKE API", count: characters.length } }));
      setCatalogStatus(`非公式NIKKE APIから${characters.length}体を取得しました。`);
    }).catch((error) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setCatalogStatus(`APIに接続できません。保存済み記録と内蔵最小データで継続します。${error instanceof Error ? `（${error.message}）` : ""}`);
    });
    return () => controller.abort();
  }, [refreshTick, setData]);

  const catalog = useMemo(() => {
    const base = remoteCatalog.length ? remoteCatalog : fallbackCharacters;
    const known = new Set(base.map((character) => character.id));
    const orphans: CharacterSummary[] = Object.entries(data.profile.records).filter(([id, record]) => !known.has(id) && record.displayName).map(([id, record]) => ({ id, name: record.displayName!, rarity: "", class: "", bursts: [], corporation: "", element: "", weapon: "", source: "fallback" }));
    return [...base, ...orphans];
  }, [remoteCatalog, data.profile.records]);

  const updateRecord = (id: string, record: NikkeRecord) => setData((current) => ({ ...current, profile: { ...current.profile, records: { ...current.profile.records, [id]: record } } }));
  const content = page === "home" ? <HomePage catalog={catalog} records={data.profile.records} coreDust={data.profile.coreDust} onCoreDustChange={(coreDust) => setData((current) => ({ ...current, profile: { ...current.profile, coreDust } }))} goNikkes={() => setPage("nikkes")} />
    : page === "nikkes" ? <NikkePage catalog={catalog} records={data.profile.records} onRecordChange={updateRecord} />
    : page === "teams" ? <TeamsPage catalog={catalog} records={data.profile.records} savedTeams={data.profile.savedTeams} onSavedTeamsChange={(savedTeams) => setData((current) => ({ ...current, profile: { ...current.profile, savedTeams } }))} />
    : <SettingsPage data={data} catalog={catalog} catalogStatus={catalogStatus} onDataChange={setData} onRefresh={refresh} />;

  return <div className="app-shell">
    <div className="top-accent" />
    <main>{content}</main>
    {saveError && <div className="save-error" role="alert">{saveError}</div>}
    <BottomNav page={page} onChange={setPage} />
  </div>;
}
