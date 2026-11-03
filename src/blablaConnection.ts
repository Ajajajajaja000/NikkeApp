import type { BlablaConnection } from "./types";

export const BLABLA_CONNECTION_KEY = "nikke-compass:blabla-connection";
const RETRY_HOURS = 6;

export function createConnection(openid: string): BlablaConnection {
  return { version: 1, openid, autoSync: true, intervalHours: 72 };
}

export function loadConnection(): BlablaConnection | null {
  try {
    const value = JSON.parse(localStorage.getItem(BLABLA_CONNECTION_KEY) ?? "null") as Partial<BlablaConnection> | null;
    if (value?.version !== 1 || typeof value.openid !== "string") return null;
    // 旧版で初回失敗後に残った接続情報も、次回起動時に入力画面へ戻す。
    if (value.lastError && !value.lastSuccessAt) {
      localStorage.removeItem(BLABLA_CONNECTION_KEY);
      return null;
    }
    return { ...value, autoSync: value.autoSync !== false, intervalHours: 72 } as BlablaConnection;
  } catch { return null; }
}

export function saveConnection(value: BlablaConnection): void {
  localStorage.setItem(BLABLA_CONNECTION_KEY, JSON.stringify(value));
}

export function clearConnection(): void { localStorage.removeItem(BLABLA_CONNECTION_KEY); }

export function shouldAutoSync(value: BlablaConnection | null, now = Date.now()): boolean {
  if (!value?.autoSync) return false;
  const success = value.lastSuccessAt ? Date.parse(value.lastSuccessAt) : 0;
  if (success && now - success < value.intervalHours * 60 * 60 * 1000) return false;
  const attempt = value.lastAttemptAt ? Date.parse(value.lastAttemptAt) : 0;
  if (value.lastError && attempt && now - attempt < RETRY_HOURS * 60 * 60 * 1000) return false;
  return true;
}

export function maskedOpenid(openid: string): string {
  if (openid.length < 9) return `${openid.slice(0, 2)}•••`;
  return `${openid.slice(0, 4)}••••${openid.slice(-4)}`;
}
