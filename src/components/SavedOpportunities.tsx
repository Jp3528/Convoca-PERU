"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/lib/data";
import { Icon } from "./Icon";
import { OpportunityCard } from "./OpportunityCard";
import { useBrowserStorage } from "@/lib/browser-storage";
import type { Discovery } from "@/lib/import-types";
import { discoveryKey } from "@/lib/discoveries";
import { DiscoveryCard } from "./DiscoveryCard";

export function useSaved() {
  const { raw, write } = useBrowserStorage("convoca-saved-v1");
  const saved = useMemo<string[]>(() => {
    try {
      const value: unknown = JSON.parse(raw);
      return Array.isArray(value)
        ? value.filter(
            (x): x is string =>
              typeof x === "string" && /^[a-z0-9-]{1,160}$/.test(x),
          )
        : [];
    } catch {
      return [];
    }
  }, [raw]);
  function toggle(slug: string) {
    const updated = saved.includes(slug)
      ? saved.filter((x) => x !== slug)
      : [...saved, slug];
    return write(JSON.stringify(updated));
  }
  function removeMany(keys: string[]) {
    return write(JSON.stringify(saved.filter((key) => !keys.includes(key))));
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
              : "Guardada solo durante esta sesión: el almacenamiento está bloqueado.",
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
export function SavedList({
  opportunities,
  discoveries,
}: {
  opportunities: Opportunity[];
  discoveries: Discovery[];
}) {
  const { saved, removeMany } = useSaved();
  const list = opportunities.filter((o) => saved.includes(o.slug));
  const automatic = discoveries.filter((c) => saved.includes(discoveryKey(c)));
  const available = new Set([
    ...opportunities.map((o) => o.slug),
    ...discoveries.map(discoveryKey),
  ]);
  const unavailable = saved.filter((key) => !available.has(key));
  const total = list.length + automatic.length;
  return (
    <>
      <div className="results-toolbar">
        <p>
          <strong>{total}</strong>{" "}
          {total === 1 ? "convocatoria guardada" : "convocatorias guardadas"}
        </p>
        <span className="muted">En este navegador</span>
      </div>
      {unavailable.length > 0 && (
        <div className="catalog-note saved-unavailable">
          <p>
            {unavailable.length} de tus guardados ya no están disponibles.
            Pueden haber vencido, cambiado o dejado de aparecer en la fuente.
          </p>
          <button
            type="button"
            className="text-button"
            onClick={() => removeMany(unavailable)}
          >
            Quitar guardados no disponibles
          </button>
        </div>
      )}
      {list.length > 0 && (
        <div className="listing-stack">
          {list.map((o) => (
            <OpportunityCard key={o.slug} opportunity={o} />
          ))}
        </div>
      )}
      {automatic.length > 0 && (
        <section
          className="saved-discoveries"
          aria-labelledby="saved-automatic"
        >
          <div className="section-heading">
            <div>
              <h2 id="saved-automatic">Tus hallazgos automáticos</h2>
              <p>
                Comprueba las bases y el plazo en la fuente antes de postular.
              </p>
            </div>
          </div>
          <div className="discovery-grid">
            {automatic.map((c) => (
              <DiscoveryCard key={c.id} discovery={c} />
            ))}
          </div>
        </section>
      )}
      {total === 0 && (
        <div className="empty-state">
          <span className="empty-icon">
            <Icon name="bookmark" size={32} />
          </span>
          <h2>Tu próxima oportunidad, a mano.</h2>
          <p>
            Guarda las convocatorias que te interesen con el ícono de marcador.
            Podrás volver a ellas desde aquí.
          </p>
          <Link className="button-primary" href="/convocatorias">
            Explorar convocatorias <Icon name="arrow" />
          </Link>
        </div>
      )}
    </>
  );
}
