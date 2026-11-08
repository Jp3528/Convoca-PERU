"use client";
import { useCallback, useSyncExternalStore } from "react";
const memory = new Map<string, string>();
const volatile = new Set<string>();
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("convoca-local", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("convoca-local", callback);
  };
}
export function useBrowserStorage(key: string) {
  const snapshot = useCallback(() => {
    if (volatile.has(key)) return memory.get(key) || "";
    try {
      return localStorage.getItem(key) || "";
    } catch {
      return memory.get(key) || "";
    }
  }, [key]);
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  function write(value: string) {
    memory.set(key, value);
    let persistent = true;
    try {
      localStorage.setItem(key, value);
      volatile.delete(key);
    } catch {
      persistent = false;
      volatile.add(key);
    }
    window.dispatchEvent(new Event("convoca-local"));
    return persistent;
  }
  return {
    raw,
    write,
    update: (change: (value: string) => string) => write(change(snapshot())),
  };
}
export function downloadText(
  filename: string,
  content: string,
  type = "text/plain",
) {
  const url = URL.createObjectURL(
    new Blob([content], { type: type + ";charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
