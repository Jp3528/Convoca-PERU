"use client";

import { useState } from "react";
import Link from "next/link";
import { departments, opportunities, type Opportunity } from "@/lib/data";

export default function AdminPage() {
  const [draftList, setDraftList] = useState<Opportunity[]>(opportunities.slice(0, 3));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    sourceUrl: "",
    endsAt: "",
    type: "Preprofesional",
    sector: "Publico",
    department: "Lima",
    modality: "Presencial",
    vacancies: "2",
    careers: "Administracion, Ingenieria Industrial",
    summary: "",
  });

  const checks = [
    "La fuente oficial abre correctamente y no solicita pagos",
    "La fecha de cierre esta dentro del cronograma vigente",
    "El resumen redacta en lenguaje claro sin copiar PDFs extensos",
    "Carreras, region y modalidad estan estandarizadas en el sistema",
    "Vacantes y remuneracion/subvencion coinciden con las bases",
  ];

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.organization) return;

    const newDraft: Opportunity = {
      slug: `draft-${Date.now()}`,
      title: formData.title,
      organization: formData.organization,
      sector: formData.sector as "Publico" | "Privado",
      type: formData.type as any,
      department: formData.department,
      modality: formData.modality as any,
      vacancies: parseInt(formData.vacancies) || 1,
      careers: formData.careers.split(",").map((c) => c.trim()).filter(Boolean),
      endsAt: formData.endsAt || "2026-11-15",
      stipend: "Segun bases oficiales",
      summary: formData.summary || "Borrador de oportunidad pendiente de validacion formal.",
      requirements: ["Revisar bases adjuntas."],
      steps: ["Postulacion via portal oficial."],
      sourceName: formData.organization,
      sourceUrl: formData.sourceUrl || "https://www.gob.pe/",
      publishedAt: new Date().toISOString().split("T")[0],
    };

    setDraftList([newDraft, ...draftList]);
    setSavedSuccess(true);
    // Reset fields
    setFormData({
      title: "",
      organization: "",
      sourceUrl: "",
      endsAt: "",
      type: "Preprofesional",
      sector: "Publico",
      department: "Lima",
      modality: "Presencial",
      vacancies: "2",
      careers: "Administracion, Ingenieria Industrial",
      summary: "",
    });
  };

  return (
    <main className="page-shell">
      <nav className="mini-nav" aria-label="Secciones">
        <Link href="/">Inicio</Link>
        <Link href="/convocatorias">Convocatorias</Link>
        <Link href="/blog">Guias</Link>
        <Link href="/contacto">Contacto</Link>
      </nav>

      <header className="page-header">
        <p className="eyebrow">Panel Editorial</p>
        <h1>Control y Publicacion de Convocatorias</h1>
        <p>
          Herramienta de gestion editorial para verificar la fuente oficial, registrar los requisitos
          estructurados y pasar los controles de calidad antes de publicar en el portal.
        </p>
      </header>

      {savedSuccess && (
        <div
          style={{
            padding: "16px 20px",
            backgroundColor: "#edf8f3",
            border: "1px solid #11845b",
            borderRadius: "var(--radius)",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#11845b", fontWeight: 900, fontSize: "1.2rem" }}>✓</span>
            <span style={{ color: "#0f6d4f", fontWeight: 700 }}>
              ¡Borrador guardado con exito en la cola editorial! Aparece en la lista de borradores para revision.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSavedSuccess(false)}
            style={{
              background: "none",
              border: "none",
              color: "#0f6d4f",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ✕ Cerrar
          </button>
        </div>
      )}

      <section className="admin-grid">
        <article className="admin-card admin-card-large">
          <div className="admin-row">
            <span className="status-pill">Modulo de Entrada</span>
            <strong>Registrar nueva convocatoria</strong>
          </div>

          <form className="admin-form" onSubmit={handleSaveDraft}>
            <div className="form-grid">
              <label>
                URL o Enlace a la fuente oficial *
                <input
                  type="url"
                  required
                  placeholder="https://www.gob.pe/... o portal oficial"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                />
              </label>
              <label>
                Fecha limite de postulacion *
                <input
                  type="date"
                  required
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                />
              </label>
            </div>

            <label>
              Titulo descriptivo de la convocatoria *
              <input
                type="text"
                required
                placeholder="Ej. Practicas Preprofesionales para Administracion y Sistemas"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </label>

            <div className="form-grid">
              <label>
                Entidad o Empresa convocante *
                <input
                  type="text"
                  required
                  placeholder="Ej. SUNAT, Poder Judicial, BCP, Indecopi..."
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                />
              </label>
              <label>
                Sector institucional *
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                >
                  <option value="Publico">Sector Publico (Estado)</option>
                  <option value="Privado">Sector Privado</option>
                </select>
              </label>
            </div>

            <div className="form-grid">
              <label>
                Tipo de oportunidad *
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Preprofesional">Practicas Preprofesionales</option>
                  <option value="Profesional">Practicas Profesionales</option>
                  <option value="CAS">Contrato CAS (Publico)</option>
                  <option value="Empleo">Empleo Privado / Regular</option>
                </select>
              </label>
              <label>
                Departamento / Region *
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-grid">
              <label>
                Modalidad de trabajo *
                <select
                  value={formData.modality}
                  onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Hibrido">Hibrido</option>
                  <option value="Remoto">Remoto</option>
                </select>
              </label>
              <label>
                Numero de vacantes disponibles
                <input
                  type="number"
                  min="1"
                  value={formData.vacancies}
                  onChange={(e) => setFormData({ ...formData, vacancies: e.target.value })}
                />
              </label>
            </div>

            <label>
              Carreras solicitadas (separadas por comas)
              <input
                type="text"
                placeholder="Ej. Derecho, Economia, Contabilidad"
                value={formData.careers}
                onChange={(e) => setFormData({ ...formData, careers: e.target.value })}
              />
            </label>

            <label>
              Resumen sintetizado del puesto y funciones
              <textarea
                rows={3}
                placeholder="Escribe en 2 o 3 oraciones claras el objetivo del puesto, principales labores y perfil buscado."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </label>

            <button className="button-primary" type="submit">
              Guardar borrador para revision editorial
            </button>
          </form>
        </article>

        <aside className="admin-side">
          <article className="admin-card">
            <p className="eyebrow">Estandares Editoriales</p>
            <h2>Criterios de Verificacion</h2>
            <ul className="check-list">
              {checks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </article>

          <article className="admin-card">
            <p className="eyebrow">Cola de Produccion</p>
            <h2>Borradores en Revision ({draftList.length})</h2>
            <ul className="draft-list">
              {draftList.map((draft, i) => (
                <li key={`${draft.slug}-${i}`}>
                  <strong>{draft.organization}</strong>
                  <span>{draft.title}</span>
                  <small style={{ color: "var(--primary)", fontWeight: 700 }}>
                    {draft.type} · {draft.department} · Cierre: {draft.endsAt}
                  </small>
                </li>
              ))}
            </ul>
          </article>
        </aside>
      </section>
    </main>
  );
}
