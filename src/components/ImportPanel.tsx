"use client";
import { useEffect, useState } from "react";
import { daysUntil, type Opportunity } from "@/lib/data";
import {
  importSources,
  type ImportCandidate,
  type ImportReport,
  type AutomationStatus,
} from "@/lib/import-types";
import type { PortalRecord } from "@/lib/portal-types";

export function ImportPanel({
  records,
  onRecords,
  onPrepare,
  initialAutomation,
}: {
  records: PortalRecord[];
  onRecords: (records: PortalRecord[]) => void;
  onPrepare: (candidate: PortalRecord, linked?: PortalRecord) => void;
  initialAutomation: AutomationStatus;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ImportReport | null>(null);
  const [filter, setFilter] = useState("all");
  const [sourceId, setSourceId] = useState<string>(importSources[0].id);
  const [automation, setAutomation] = useState(initialAutomation);
  const [refreshError, setRefreshError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch("/api/editor/import", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error();
        const result = await response.json();
        setAutomation(result.automation);
        onRecords(result.records);
        setRefreshError(false);
      } catch {
        if (!controller.signal.aborted) setRefreshError(true);
      }
    }
    void refresh();
    const timer = setInterval(refresh, 30000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [onRecords]);
  const automatic = automation.state;
  const candidates = records.filter((r) => r.kind === "import");
  const visible = candidates.filter((r) =>
    filter === "archived"
      ? r.status === "archived"
      : r.status === "draft" &&
        (filter !== "active" ||
          daysUntil((r.payload as ImportCandidate).endsAt) >= 0),
  );
  const lastCheck = candidates
    .map((r) => (r.payload as ImportCandidate).lastCheckedAt)
    .sort()
    .at(-1);
  const date = (value: string) =>
    new Date(value).toLocaleString("es-PE", { timeZone: "America/Lima" });
  const calendarDate = (value: string) => value.split("-").reverse().join("/");
  async function submit(body: unknown) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/editor/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No se pudo importar.");
      if (result.report) {
        setReport(result.report);
        onRecords(result.records);
      } else
        onRecords([
          result.record,
          ...records.filter((r) => r.id !== result.record.id),
        ]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo conectar. Tus borradores guardados se conservan.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="import-panel" aria-busy={busy}>
      <section className="admin-card automation-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EL PORTAL BUSCA POR TI</p>
            <h2>Búsqueda automática de convocatorias</h2>
          </div>
          <span
            className={
              automation.enabled && automation.scheduler !== "missing"
                ? "ready-badge"
                : "pending-badge"
            }
          >
            {automation.enabled && automation.scheduler !== "missing"
              ? "Activa"
              : "Pendiente"}
          </span>
        </div>
        <p>
          {automation.scheduler === "vercel"
            ? "Consulta diaria programada alrededor de las 7:00 a. m. de Lima. Se ejecuta aunque nadie visite el portal."
            : automation.scheduler === "local"
              ? `El servidor consulta las fuentes cada ${automation.intervalMinutes} minutos, aunque cierres la pestaña. Mantén encendido el servidor local.`
              : "Inicia el portal con npm run dev o npm run start:local para ejecutar las búsquedas periódicas."}
        </p>
        <div className="automation-metrics">
          <div>
            <span>Última búsqueda</span>
            <strong>
              {automatic ? date(automatic.startedAt) : "En preparación"}
            </strong>
          </div>
          <div>
            <span>Próxima búsqueda prevista</span>
            <strong>
              {automatic?.status === "running"
                ? "Buscando ahora…"
                : automatic
                  ? date(automatic.nextRunAt)
                  : "Al iniciar el servicio"}
            </strong>
          </div>
          <div>
            <span>Estado de la última búsqueda</span>
            <strong>
              {automatic?.status === "success"
                ? "Fuentes consultadas"
                : automatic?.status === "partial"
                  ? "Completada con incidencias"
                  : automatic?.status === "error"
                    ? "Error al consultar"
                    : automatic?.status === "running"
                      ? "En curso"
                      : "Todavía sin ejecutar"}
            </strong>
          </div>
        </div>
        {automatic?.reports.map((result) => (
          <p className="automation-result" key={result.sourceId}>
            <strong>
              {importSources.find((s) => s.id === result.sourceId)?.name ||
                result.sourceId}
              :
            </strong>{" "}
            {result.found} encontrados · {result.created} nuevos ·{" "}
            {result.updated} actualizados · {result.expired} vencidos.
          </p>
        ))}
        {automatic?.errors.map((issue) => (
          <p className="notice notice-error" key={issue.sourceId}>
            {importSources.find((s) => s.id === issue.sourceId)?.name ||
              issue.sourceId}
            : {issue.message}
          </p>
        ))}
        {refreshError && (
          <p className="muted">
            No se pudo actualizar este estado. La búsqueda se ejecuta en el
            servidor; recarga para volver a comprobarlo.
          </p>
        )}
        <p className="muted">
          Los datos se actualizan en esta vista cada 30 segundos. Las fichas
          editoriales publicadas conservan su revisión.
        </p>
      </section>
      <section className="admin-card import-intro">
        <div>
          <p className="eyebrow">FUENTES OFICIALES</p>
          <h2>Revisa las fuentes cuando lo necesites.</h2>
          <p>
            Las búsquedas periódicas guardan los resultados automáticamente.
            También puedes adelantar una consulta o completar una ficha
            editorial.
          </p>
        </div>
        <form
          className="admin-form"
          action="/api/editor/import"
          method="post"
          onSubmit={(event) => {
            event.preventDefault();
            void submit({
              action: "scan",
              sourceId: new FormData(event.currentTarget).get("sourceId"),
            });
          }}
        >
          <label>
            Fuente de convocatorias
            <select
              name="sourceId"
              value={sourceId}
              onChange={(event) => setSourceId(event.target.value)}
            >
              {importSources.map((source) => (
                <option value={source.id} key={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </label>
          <button className="button-primary" disabled={busy} type="submit">
            {busy ? "Consultando fuente…" : "Buscar convocatorias"}
          </button>
          <p className="muted">
            Consulta manual · intervalo mínimo de 5 minutos.
          </p>
        </form>
      </section>
      <p className="import-source-note">
        {importSources.find((source) => source.id === sourceId)?.description}{" "}
        <a
          className="text-link"
          href={importSources.find((source) => source.id === sourceId)?.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir fuente oficial ↗
        </a>
      </p>
      <div role="status" aria-live="polite">
        {busy && (
          <p className="notice">
            Consultando la fuente oficial. Puede tardar unos segundos.
          </p>
        )}
        {report && !busy && (
          <p className="notice">
            Consulta completada: {report.found} encontrados · {report.created}{" "}
            nuevos · {report.updated} con cambios · {report.unchanged} sin
            cambios · {report.expired} vencidos.
            {report.conflicts > 0
              ? ` ${report.conflicts} registros cambiaron durante la consulta; recarga para revisarlos.`
              : ""}{" "}
            Los resultados se guardaron para revisión; no se publicaron ofertas.
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="notice notice-error">
          {error}
        </p>
      )}
      <section className="admin-card">
        <div className="section-heading import-list-heading">
          <div>
            <h2>Bandeja de revisión</h2>
            <p className="muted">
              {lastCheck
                ? "Última consulta: " + date(lastCheck) + " · hora de Lima"
                : "Todavía no has consultado ninguna fuente."}
            </p>
          </div>
          <label className="import-filter">
            Mostrar
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">Todos los borradores</option>
              <option value="active">Con cierre vigente</option>
              <option value="archived">Archivados</option>
            </select>
          </label>
        </div>
        {visible.length === 0 ? (
          <div className="import-empty">
            <h3>
              {candidates.length
                ? "No hay resultados con este filtro."
                : "Tu próxima publicación empieza aquí."}
            </h3>
            <p>
              {candidates.length
                ? "Prueba con todos los borradores. Los vencidos se conservan como referencia y requieren revisar el plazo antes de publicar."
                : "Pulsa Buscar convocatorias para cargar los datos del listado oficial."}
            </p>
          </div>
        ) : (
          <ul className="import-list">
            {visible.map((record) => {
              const candidate = record.payload as ImportCandidate;
              const linked = records.find(
                (r) =>
                  r.kind === "opportunity" &&
                  (r.payload as Opportunity).importProvenance?.candidateId ===
                    record.id,
              );
              const changed =
                linked &&
                (linked.payload as Opportunity).importProvenance
                  ?.fingerprint !== candidate.fingerprint;
              const expired = daysUntil(candidate.endsAt) < 0;
              return (
                <li key={record.id}>
                  <div className="import-card-heading">
                    <span className="eyebrow">
                      {candidate.organization} · {candidate.reference}
                    </span>
                    <span className={expired ? "pending-badge" : "ready-badge"}>
                      {expired ? "Plazo vencido" : "Cierre vigente"}
                    </span>
                  </div>
                  <h3>{candidate.title}</h3>
                  <p className="muted">{candidate.organization}</p>
                  <p className="import-period">
                    Periodo del listado: {calendarDate(candidate.startsAt)} —{" "}
                    {calendarDate(candidate.endsAt)}
                  </p>
                  <p className="import-review-note">
                    {changed
                      ? "La fuente cambió desde la última revisión. La ficha editorial se conserva y necesita una nueva revisión."
                      : linked
                        ? `Ficha editorial ${linked.status === "published" ? "publicada" : linked.status === "archived" ? "archivada" : "en borrador"}.`
                        : "Pendiente: ubicación, modalidad, vacantes, remuneración, carreras, requisitos y resumen propio."}
                  </p>
                  <div className="form-buttons">
                    {record.status === "draft" && (
                      <button
                        className="button-secondary"
                        type="button"
                        disabled={busy}
                        onClick={() => onPrepare(record, linked)}
                      >
                        {linked ? "Revisar ficha" : "Completar ficha"}
                      </button>
                    )}
                    <a
                      className="text-link"
                      href={candidate.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver fuente ↗
                    </a>
                    <button
                      className="text-button"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void submit({
                          action:
                            record.status === "archived" ? "reopen" : "archive",
                          id: record.id,
                          revision: record.revision,
                        })
                      }
                    >
                      {record.status === "archived" ? "Reabrir" : "Archivar"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
