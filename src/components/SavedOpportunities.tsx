"use client";
import { useMemo, useState } from "react";
import { Icon } from "./Icon";
import { useBrowserStorage } from "@/lib/browser-storage";

function savedKeys(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (x): x is string =>
                typeof x === "string" && /^[a-z0-9-]{1,160}$/.test(x),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}

export function useSaved() {
  const { raw, update } = useBrowserStorage("convoca-saved-v1");
  const saved = useMemo(() => savedKeys(raw), [raw]);
  function toggle(slug: string) {
    return update((value) => {
      const keys = savedKeys(value);
      return JSON.stringify(
        keys.includes(slug)
          ? keys.filter((key) => key !== slug)
          : [...keys, slug],
      );
    });
  }
  function removeMany(keys: string[]) {
    const removed = new Set(keys);
    return update((value) =>
      JSON.stringify(savedKeys(value).filter((key) => !removed.has(key))),
    );
  }
  return { saved, toggle, removeMany };
}
export function SavedCount() {
  const { saved } = useSaved();
  return saved.length > 0 ? (
    <span className="nav-count">{saved.length}</span>
  ) : null;
}
export function SaveButton({
  slug,
  full = false,
}: {
  slug: string;
  full?: boolean;
}) {
  const { saved, toggle } = useSaved();
  const [notice, setNotice] = useState("");
  const active = saved.includes(slug);
  return (
    <span className="save-control">
      <button
        type="button"
        className={`${full ? "button-secondary" : "icon-button"} ${active ? "is-saved" : ""}`}
        aria-label={active ? "Quitar de guardados" : "Guardar convocatoria"}
        aria-pressed={active}
        onClick={() => {
          const persistent = toggle(slug);
          setNotice(
            persistent
              ? active
                ? "Convocatoria quitada de guardados"
                : "Convocatoria guardada en este navegador"
              : "Cambio aplicado durante esta visita. El navegador bloqueó el almacenamiento.",
          );
        }}
      >
        <Icon name="bookmark" />
        {full && (active ? "Guardada" : "Guardar convocatoria")}
      </button>
      <span className="sr-only" role="status">
        {notice}
      </span>
    </span>
  );
}
