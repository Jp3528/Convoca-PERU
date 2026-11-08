"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/data";
import { useBrowserStorage } from "@/lib/browser-storage";
import {
  readApplications,
  savedApplications,
  type SavedJob,
  type SavedSummary,
} from "@/lib/saved-applications";
import { DeadlineBadge } from "./DeadlineBadge";
import { Icon } from "./Icon";
import { useSaved } from "./SavedOpportunities";

const filters = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "sent", label: "Enviadas" },
] as const;
type Filter = (typeof filters)[number]["value"];

export function SavedTracker({ catalog }: { catalog: SavedJob[] }) {
  const { saved, removeMany } = useSaved();
  const { raw, update } = useBrowserStorage("convoca-applications-v1");
  const sent = useMemo(() => readApplications(raw), [raw]);
  const [filter, setFilter] = useState<Filter>("all");
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const activeFilter = useRef<HTMLButtonElement>(null);
  const { rows, unavailable } = savedApplications(saved, catalog, sent);
  const sentCount = rows.filter((row) => row.sent).length;
  const count = {
    all: rows.length,
    pending: rows.length - sentCount,
    sent: sentCount,
  };
  const visible = rows.filter(
    (row) => filter === "all" || row.sent === (filter === "sent"),
  );

  function changeStatus(summary: SavedSummary, submitted: boolean) {
    const persistent = update((value) => {
      const entries = readApplications(value);
      if (submitted) {
        const { key, title, organization, endsAt } = summary;
        entries.set(key, { key, title, organization, endsAt });
      } else entries.delete(summary.key);
      return JSON.stringify([...entries.values()]);
    });
    setNotice(
      persistent
        ? submitted
          ? "Postulación marcada como enviada."
          : "Convocatoria marcada como pendiente."
        : "Cambio aplicado durante esta visita. El navegador bloqueó el almacenamiento.",
    );
    if (!submitted && !catalog.some((job) => job.key === summary.key))
      heading.current?.focus();
    else if (filter !== "all") activeFilter.current?.focus();
  }

  function remove(keys: string[]) {
    const persistent = removeMany(keys);
    const removed = new Set(keys);
    const historySaved = update((value) =>
      JSON.stringify(
        [...readApplications(value).values()].filter(
          (entry) => !removed.has(entry.key),
        ),
      ),
    );
    setNotice(
      persistent && historySaved
        ? "Convocatorias retiradas de guardados."
        : "Cambio aplicado durante esta visita. El navegador bloqueó el almacenamiento.",
    );
    heading.current?.focus();
  }

  return (
    <section className="saved-tracker" aria-labelledby="saved-tracker-title">
      <div className="saved-tracker-toolbar">
        <div>
          <h2 id="saved-tracker-title" ref={heading} tabIndex={-1}>
            Tus convocatorias
          </h2>
          <p className="muted">
            {saved.length} {saved.length === 1 ? "guardada" : "guardadas"} ·{" "}
            {sentCount} {sentCount === 1 ? "enviada" : "enviadas"}
          </p>
        </div>
        {rows.length > 0 && (
          <div
            className="saved-tracker-filters"
            role="group"
            aria-label="Estado de postulación"
          >
            {filters.map((option) => (
              <button
                key={option.value}
                ref={filter === option.value ? activeFilter : undefined}
                type="button"
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label} <span>{count[option.value]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="saved-tracker-notice" role="status">
        {notice}
      </p>
      {unavailable.length > 0 && (
        <div className="catalog-note saved-unavailable">
          <p>
            {unavailable.length === 1
              ? "Una convocatoria guardada ya no aparece en el catálogo."
              : `${unavailable.length} convocatorias guardadas ya no aparecen en el catálogo.`}
          </p>
          <button
            type="button"
            className="text-button"
            onClick={() => remove(unavailable)}
          >
            Quitar las no disponibles
          </button>
        </div>
      )}
      {visible.length > 0 ? (
        <ul className="saved-tracker-list">
          {visible.map(({ summary, current, sent: submitted }) => (
            <li className="saved-tracker-row" key={summary.key}>
              <div className="saved-tracker-job">
                <p className="saved-tracker-entity">
                  {summary.organization}
                  {current?.sample ? " · Muestra" : ""}
                </p>
                <h3>
                  {current ? (
                    <Link href={current.href}>{summary.title}</Link>
                  ) : (
                    summary.title
                  )}
                </h3>
                <span
                  className={`saved-tracker-status${submitted ? " is-sent" : ""}`}
                >
                  {submitted && <Icon name="check" size={15} />}
                  {submitted ? "Enviada" : "Pendiente"}
                </span>
              </div>
              <div className="saved-tracker-deadline">
                <span>
                  {current ? "Fecha de cierre" : "Último cierre registrado"}
                </span>
                <time dateTime={summary.endsAt}>
                  {formatDate(summary.endsAt)}
                </time>
                {current ? (
                  <DeadlineBadge
                    endsAt={summary.endsAt}
                    startsAt={current.startsAt}
                    availability={current.availability}
                  />
                ) : (
                  <span>Fuera del catálogo actual</span>
                )}
              </div>
              <div className="saved-tracker-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => changeStatus(summary, !submitted)}
                  aria-label={`${submitted ? "Volver a pendiente" : "Marcar como enviada"}: ${summary.title}`}
                >
                  {submitted ? "Volver a pendiente" : "Marcar como enviada"}
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => remove([summary.key])}
                  aria-label={`Quitar de guardados: ${summary.title}`}
                >
                  Quitar de guardados
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : rows.length > 0 ? (
        <div className="saved-tracker-empty">
          <h3>
            {filter === "sent"
              ? "Aún no has marcado envíos"
              : "No tienes convocatorias pendientes"}
          </h3>
          <p>
            {filter === "sent"
              ? "Cuando postules, marca la convocatoria como enviada para registrarla aquí."
              : "Las postulaciones marcadas están en Enviadas."}
          </p>
        </div>
      ) : (
        <div className="saved-tracker-empty">
          <h3>Todavía no tienes convocatorias disponibles</h3>
          <p>
            Usa el ícono de marcador en una ficha para añadirla a tu
            seguimiento.
          </p>
          <Link className="button-primary" href="/convocatorias">
            Explorar convocatorias <Icon name="arrow" size={18} />
          </Link>
        </div>
      )}
    </section>
  );
}
