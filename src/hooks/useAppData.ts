import { useEffect, useRef, useState } from "react";
import type { AppData } from "../types";
import { loadAppData, saveAppData } from "../storage";

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [saveError, setSaveError] = useState("");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        saveAppData(data);
        setSaveError("");
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "保存できませんでした。");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [data]);

  return { data, setData, saveError };
}
