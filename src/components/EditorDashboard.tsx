"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { departments, type Article, type Opportunity } from "@/lib/data";
import { display } from "@/lib/search";
import type { PortalRecord, Message } from "@/lib/portal-types";
import { downloadText } from "@/lib/browser-storage";
import { ImportPanel } from "./ImportPanel";
import type { ImportCandidate, AutomationStatus } from "@/lib/import-types";
type Readiness = { label: string; ready: boolean; detail: string };
export function EditorDashboard({
  initialRecords,
  email,
  provider,
  readiness,
  automation,
}: {
  initialRecords: PortalRecord[];
  email: string;
  provider: string;
  readiness: Readiness[];
  automation: AutomationStatus;
}) {
  const [records, setRecords] = useState(initialRecords);
  const [tab, setTab] = useState("opportunity");
  const [selected, setSelected] = useState<PortalRecord | null>(null);
  const [importCandidate, setImportCandidate] = useState<PortalRecord | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function send(body: unknown) {
    const response = await fetch("/api/editor/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo guardar.");
    setRecords((current) => [
      result,
      ...current.filter((r) => r.id !== result.id),
    ]);
    return result as PortalRecord;
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const fields = Object.fromEntries(form);
    const status =
      (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ||
      "draft";
    const payload =
      tab === "article"
        ? {
            ...fields,
            body: String(fields.body || "")
              .split(/\n\s*\n/)
              .filter(Boolean),
          }
        : {
            ...fields,
            careers: String(fields.careers || "")
              .split(/[,\n]/)
              .filter(Boolean),
            requirements: String(fields.requirements || "")
              .split("\n")
              .filter(Boolean),
            steps: String(fields.steps || "")
              .split("\n")
              .filter(Boolean),
            featured: form.has("featured"),
          };
    try {
      const result = await send({
        id: selected?.id,
        revision: selected?.revision,
        kind: tab,
        payload,
        status,
        verified: form.has("verified"),
        importId: importCandidate?.id,
        importFingerprint: (
          importCandidate?.payload as ImportCandidate | undefined
        )?.fingerprint,
      });
      setSelected(result);
      setNotice(
        status === "published"
          ? "Publicado. El contenido ya está disponible en la web."
          : status === "archived"
            ? "Contenido archivado. Ya no aparece en el catálogo público."
            : "Borrador guardado en el servidor.",
      );
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await fetch("/api/editor/session", { method: "DELETE" });
    router.refresh();
  }
  async function resolve(record: PortalRecord) {
    try {
      await send({
        id: record.id,
        action: (record.payload as Message).resolved ? "reopen" : "resolve",
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "No se pudo actualizar.",
      );
    }
  }
  const imported = importCandidate?.payload as ImportCandidate | undefined;
  const content = (selected?.payload ||
    (imported
      ? {
          title: imported.title,
          organization: imported.organization,
          type: imported.type || "CAS",
          sector: "Publico",
          sourceUrl: imported.sourceUrl,
          sourceName: imported.organization + " · Listado oficial",
          department: departments.includes(imported.location || "")
            ? imported.location
            : "",
          endsAt: imported.endsAt,
        }
      : undefined)) as Partial<Opportunity & Article> | undefined;
  function field(
    name: string,
    label: string,
    value: unknown = "",
    type = "text",
    required = true,
  ) {
    return (
      <label>
        {label}
        {required ? " *" : ""}
        <input
          name={name}
          type={type}
          defaultValue={String(value ?? "")}
          required={required}
          min={type === "number" ? 1 : undefined}
          maxLength={type === "text" ? 300 : undefined}
        />
      </label>
    );
  }
  function area(name: string, label: string, value: string, rows = 4) {
    return (
      <label>
        {label}
        <textarea
          name={name}
          rows={rows}
          defaultValue={value}
          maxLength={name === "body" ? 50000 : 6000}
          required
        />
      </label>
    );
  }
  function select(
    name: string,
    label: string,
    options: string[],
    value: string,
  ) {
    return (
      <label>
        {label}
        <select name={name} defaultValue={value}>
          {!value && <option value="">Selecciona una opción</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {display(option)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  const published = records.filter(
    (r) => r.status === "published" && !r.sample && r.kind !== "message",
  ).length;
  return (
    <>
      <header className="editor-top">
        <div>
          <p className="eyebrow">PANEL EDITORIAL</p>
          <h1>Tu contenido, en movimiento.</h1>
          <p className="muted">
            {email} ·{" "}
            {provider === "local"
              ? "Persistencia local en servidor"
              : provider === "supabase"
                ? "Supabase"
                : "Base de datos pendiente de configurar"}
          </p>
        </div>
        <button className="button-secondary" type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </header>
      <div className="editor-stats">
        <div>
          <strong>{published}</strong>
          <span>Publicaciones reales</span>
        </div>
        <div>
          <strong>
            {
              records.filter(
                (r) => r.status === "draft" && r.kind !== "message",
              ).length
            }
          </strong>
          <span>Borradores</span>
        </div>
        <div>
          <strong>
            {
              records.filter(
                (r) => r.kind === "message" && !(r.payload as Message).resolved,
              ).length
            }
          </strong>
          <span>Consultas pendientes</span>
        </div>
      </div>
      <nav className="editor-tabs" aria-label="Gestión del portal">
        {[
          ["opportunity", "Convocatorias"],
          ["article", "Guías"],
          ["import", "Importar"],
          ["message", "Consultas"],
          ["monetization", "Monetización"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={tab === key}
            onClick={() => {
              setTab(key);
              setSelected(null);
              setImportCandidate(null);
              setError("");
              setNotice("");
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {notice && (
        <div role="status" className="notice">
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" className="notice notice-error">
          {error}
        </div>
      )}
      {tab === "import" ? (
        <ImportPanel
          initialAutomation={automation}
          records={records}
          onRecords={setRecords}
          onPrepare={(candidate, linked) => {
            setImportCandidate(candidate);
            setSelected(linked || null);
            setTab("opportunity");
            setError("");
            setNotice(
              "Completa los datos que no figuran en el listado y revisa las bases antes de publicar.",
            );
          }}
        />
      ) : tab === "monetization" ? (
        <section className="admin-card">
          <p className="eyebrow">PREPARACIÓN PARA ADSENSE</p>
          <h2>Primero un portal útil. Después, los anuncios.</h2>
          <p>
            Estas comprobaciones técnicas ayudan a preparar la publicación. La
            revisión y aprobación de AdSense corresponden a Google.
          </p>
          <ul className="readiness-list">
            {readiness.map((check) => (
              <li key={check.label}>
                <span className={check.ready ? "ready-badge" : "pending-badge"}>
                  {check.ready ? "Listo" : "Pendiente"}
                </span>
                <div>
                  <strong>{check.label}</strong>
                  <p>{check.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="form-buttons">
            <a
              className="button-primary"
              href="https://adsense.google.com/start/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ir a Google AdSense
            </a>
            <a className="button-secondary" href="/ads.txt" target="_blank">
              Comprobar ads.txt
            </a>
            <Link className="text-link" href="/nosotros">
              Ver página sobre el portal →
            </Link>
          </div>
        </section>
      ) : tab === "message" ? (
        <section className="admin-card">
          <h2>Consultas recibidas</h2>
          {records.filter((r) => r.kind === "message").length === 0 ? (
            <p>
              Todavía no hay consultas. Las que se envíen desde Contacto
              aparecerán aquí.
            </p>
          ) : (
            <div className="inbox-list">
              {records
                .filter((r) => r.kind === "message")
                .map((record) => {
                  const m = record.payload as Message;
                  return (
                    <article key={record.id}>
                      <div className="section-heading">
                        <h3>{m.subject}</h3>
                        <span className="status-pill">
                          {m.resolved ? "Atendida" : "Pendiente"}
                        </span>
                      </div>
                      <p>
                        <strong>{m.name}</strong> · {m.email}
                      </p>
                      <p className="muted">
                        Referencia {record.id.slice(0, 8).toUpperCase()} ·{" "}
                        {new Date(record.created_at).toLocaleString("es-PE")}
                      </p>
                      <p className="message-body">{m.message}</p>
                      {m.sourceUrl && (
                        <p className="muted">Fuente aportada: {m.sourceUrl}</p>
                      )}
                      <button
                        className="button-secondary"
                        type="button"
                        onClick={() => resolve(record)}
                      >
                        {m.resolved
                          ? "Reabrir consulta"
                          : "Marcar como atendida"}
                      </button>
                    </article>
                  );
                })}
            </div>
          )}
        </section>
      ) : (
        <div className="admin-grid">
          <section className="admin-card">
            <div className="section-heading">
              <h2>
                {selected ? "Editar " : "Nueva "}
                {tab === "article" ? "guía" : "convocatoria"}
              </h2>
              <button
                className="button-secondary"
                type="button"
                onClick={() => {
                  setSelected(null);
                  setImportCandidate(null);
                  setNotice("");
                }}
              >
                Nuevo
              </button>
            </div>
            {selected?.sample && (
              <div className="notice">
                Contenido de muestra. Para publicar información real, crea una
                nueva entrada y revisa su fuente.
              </div>
            )}
            {imported && (
              <div className="notice import-origin">
                <strong>
                  Origen: {imported.organization} · {imported.reference}
                </strong>
                <p>
                  {imported.title} · cierre del listado:{" "}
                  {imported.endsAt.split("-").reverse().join("/")}.
                </p>
                <p>
                  La importación no incluye los requisitos de las bases. Si el
                  plazo venció, comprueba una ampliación oficial antes de
                  publicar.
                </p>
                <a
                  href={imported.sourceUrl}
                  className="text-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Revisar fuente oficial ↗
                </a>
              </div>
            )}
            <form
              key={
                (selected?.id || importCandidate?.id || "new") +
                "-" +
                (selected?.revision || 0) +
                tab
              }
              className="admin-form"
              method="post"
              action="/api/editor/content"
              onSubmit={save}
            >
              <p className="muted">
                Los campos con * son obligatorios. La URL se conserva al editar.
              </p>
              {field("title", "Título", content?.title)}
              {tab === "article" ? (
                <>
                  {field(
                    "category",
                    "Categoría",
                    content?.category || "Orientación laboral",
                  )}
                  {area(
                    "description",
                    "Descripción *",
                    content?.description || "",
                    3,
                  )}
                  {area(
                    "body",
                    "Contenido original * · separa los párrafos con una línea en blanco",
                    content?.body?.join("\n\n") || "",
                    15,
                  )}
                </>
              ) : (
                <>
                  {field(
                    "organization",
                    "Entidad o empresa",
                    content?.organization,
                  )}
                  <div className="form-grid">
                    {select(
                      "sector",
                      "Sector",
                      ["Publico", "Privado"],
                      content?.sector || "Publico",
                    )}
                    {select(
                      "type",
                      "Tipo",
                      ["Preprofesional", "Profesional", "CAS", "Empleo"],
                      content?.type || "Preprofesional",
                    )}
                    {select(
                      "department",
                      "Departamento",
                      departments,
                      content?.department || (imported ? "" : "Lima"),
                    )}
                    {select(
                      "modality",
                      "Modalidad",
                      ["Presencial", "Hibrido", "Remoto"],
                      content?.modality || (imported ? "" : "Presencial"),
                    )}
                    {field(
                      "province",
                      "Provincia",
                      content?.province,
                      "text",
                      false,
                    )}
                    {field(
                      "vacancies",
                      "Vacantes",
                      content?.vacancies ?? (imported ? "" : 1),
                      "number",
                    )}
                    {field(
                      "endsAt",
                      "Fecha de cierre",
                      content?.endsAt,
                      "date",
                    )}
                    {field(
                      "stipend",
                      "Remuneración o referencia a las bases",
                      content?.stipend,
                    )}
                  </div>
                  {field(
                    "sourceUrl",
                    "Enlace HTTPS de las bases o portal de la entidad",
                    content?.sourceUrl,
                    "url",
                  )}
                  {field(
                    "sourceName",
                    "Nombre de la fuente",
                    content?.sourceName,
                  )}
                  {field(
                    "careers",
                    "Carreras · separadas por comas",
                    content?.careers?.join(", "),
                  )}
                  {area(
                    "summary",
                    "Resumen propio de la oportunidad *",
                    content?.summary || "",
                  )}
                  {area(
                    "requirements",
                    "Requisitos * · uno por línea",
                    content?.requirements?.join("\n") || "",
                  )}
                  {area(
                    "steps",
                    "Pasos de postulación * · uno por línea",
                    content?.steps?.join("\n") || "",
                  )}
                  <label className="checkbox-line">
                    <input
                      type="checkbox"
                      name="featured"
                      defaultChecked={content?.featured}
                    />{" "}
                    Destacar en el portal
                  </label>
                </>
              )}
              <label className="checkbox-line">
                <input
                  type="checkbox"
                  name="verified"
                  defaultChecked={selected?.verified}
                />{" "}
                Revisé la fuente, la información y los derechos del contenido
                antes de publicar.
              </label>
              <div className="form-buttons">
                <button
                  className="button-secondary"
                  disabled={busy}
                  type="submit"
                  name="status"
                  value="draft"
                >
                  Guardar borrador
                </button>
                <button
                  className="button-primary"
                  disabled={busy}
                  type="submit"
                  name="status"
                  value="published"
                >
                  {busy ? "Guardando…" : "Publicar"}
                </button>
                {selected && (
                  <button
                    className="button-secondary"
                    type="submit"
                    name="status"
                    value="archived"
                    disabled={busy}
                  >
                    Archivar
                  </button>
                )}
              </div>
              {selected && (
                <button
                  className="text-button"
                  type="button"
                  onClick={() =>
                    downloadText(
                      selected.slug + ".json",
                      JSON.stringify(selected, null, 2),
                      "application/json",
                    )
                  }
                >
                  Exportar copia JSON
                </button>
              )}
            </form>
          </section>
          <aside className="admin-card">
            <h2>Contenido del portal</h2>
            <ul className="draft-list">
              {records
                .filter((r) => r.kind === tab)
                .map((record) => (
                  <li key={record.id}>
                    <strong>
                      {(record.payload as Opportunity | Article).title}
                    </strong>
                    <small>
                      {record.status === "published"
                        ? "Publicado"
                        : record.status === "archived"
                          ? "Archivado"
                          : "Borrador"}
                      {record.sample ? " · Muestra" : ""}
                    </small>
                    <div className="draft-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(record);
                          setImportCandidate(null);
                          setError("");
                          setNotice("");
                        }}
                      >
                        Editar
                      </button>
                      {record.status === "published" && (
                        <Link
                          href={
                            (record.kind === "article"
                              ? "/blog/"
                              : "/convocatorias/") + record.slug
                          }
                          target="_blank"
                        >
                          Ver en la web →
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </aside>
        </div>
      )}
    </>
  );
}
