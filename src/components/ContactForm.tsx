"use client";
import { useMemo, useState } from "react";
import { useBrowserStorage } from "@/lib/browser-storage";
const initial = {
  name: "",
  email: "",
  subject: "Consulta sobre una convocatoria",
  organization: "",
  sourceUrl: "",
  message: "",
  website: "",
};
export function ContactForm({ report = "" }: { report?: string }) {
  const { raw, write } = useBrowserStorage("convoca-contact-v1");
  const previous = useMemo(() => {
    try {
      const value = JSON.parse(raw);
      return value &&
        Object.keys(initial)
          .filter((k) => k !== "website")
          .every((k) => typeof value[k] === "string")
        ? { ...initial, ...value }
        : null;
    } catch {
      return null;
    }
  }, [raw]);
  const [form, setForm] = useState({
    ...initial,
    subject: report ? "Reportar un dato o enlace" : initial.subject,
    message: report
      ? "Convocatoria: " + report + "\n\nDetalle del reporte: "
      : "",
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function update(key: keyof typeof initial, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }
  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setNotice(
        "Consulta recibida. Tu referencia es " +
          result.reference +
          ". El equipo puede revisarla en su bandeja editorial.",
      );
      setForm(initial);
      write("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar. Guarda un borrador y vuelve a intentarlo.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-row">
        <span className="status-pill">CONTACTO EDITORIAL</span>
        <strong>Cuéntanos en qué podemos ayudarte.</strong>
      </div>
      {previous && (
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setForm(previous);
            setNotice("Borrador recuperado.");
          }}
        >
          Recuperar borrador
        </button>
      )}
      <form
        className="admin-form"
        method="post"
        action="/api/contact"
        onSubmit={send}
      >
        <p className="muted">
          Los campos con * son obligatorios. No incluyas documentos personales
          ni contraseñas.
        </p>
        <div className="form-grid">
          <label>
            Nombre completo *
            <input
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              minLength={2}
              maxLength={120}
            />
          </label>
          <label>
            Correo electrónico *
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              maxLength={254}
            />
          </label>
        </div>
        <label>
          Motivo de la consulta
          <select
            name="subject"
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
          >
            {[
              "Consulta sobre una convocatoria",
              "Reportar un dato o enlace",
              "Difundir una convocatoria",
              "Sugerencia para el portal",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <div className="form-grid">
          <label>
            Entidad o empresa (opcional)
            <input
              name="organization"
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
              maxLength={200}
            />
          </label>
          <label>
            Enlace de referencia (opcional)
            <input
              name="sourceUrl"
              type="url"
              value={form.sourceUrl}
              onChange={(e) => update("sourceUrl", e.target.value)}
              maxLength={1500}
            />
          </label>
        </div>
        <label>
          Tu mensaje *
          <textarea
            name="message"
            rows={6}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            required
            minLength={20}
            maxLength={5000}
          />
        </label>
        <div className="sr-only" aria-hidden="true">
          <label>
            Sitio web
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
            />
          </label>
        </div>
        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-buttons">
          <button type="submit" className="button-primary" disabled={busy}>
            {busy ? "Enviando…" : "Enviar consulta"}
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              const stored = write(JSON.stringify(form));
              setNotice(
                stored
                  ? "Borrador guardado en este navegador. Todavía no se ha enviado."
                  : "El navegador bloqueó el guardado. Mantén esta página abierta para conservar el texto.",
              );
            }}
          >
            Guardar borrador
          </button>
        </div>
        <p className="muted">
          Al enviar, compartes estos datos con el equipo para atender tu
          consulta.{" "}
          <a className="text-link" href="/privacidad">
            Consulta la privacidad.
          </a>
        </p>
      </form>
      {notice && (
        <p role="status" className="notice" style={{ marginTop: 20 }}>
          {notice}
        </p>
      )}
    </>
  );
}
