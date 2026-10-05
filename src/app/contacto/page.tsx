"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "publicar",
    organization: "",
    sourceUrl: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="page-shell">
      <nav className="mini-nav" aria-label="Secciones">
        <Link href="/">Inicio</Link>
        <Link href="/convocatorias">Convocatorias</Link>
        <Link href="/blog">Guias</Link>
        <Link href="/admin">Panel editorial</Link>
      </nav>

      <header className="page-header">
        <p className="eyebrow">Atencion Editorial & Soporte</p>
        <h1>Contacto y Envio de Convocatorias</h1>
        <p>
          ¿Deseas difundir una convocatoria oficial de tu institucion, reportar una fecha desactualizada
          o tienes una consulta? Escribenos directamente.
        </p>
      </header>

      <div className="admin-grid">
        <section className="admin-card admin-card-large">
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#e8f8f0",
                  color: "#11845b",
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                }}
              >
                ✓
              </div>
              <h2 style={{ marginBottom: "10px" }}>¡Mensaje recibido con exito!</h2>
              <p style={{ maxWidth: "48ch", margin: "0 auto 24px", color: "var(--muted)" }}>
                Gracias por comunicarte con el equipo de Convoca Peru. Nuestro equipo editorial revisara
                tu solicitud o reporte en un plazo maximo de 24 horas habiles.
              </p>
              <button
                className="button-secondary"
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    subject: "publicar",
                    organization: "",
                    sourceUrl: "",
                    message: "",
                  });
                }}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <>
              <div className="admin-row">
                <span className="status-pill">Canal Oficial</span>
                <strong>Formulario de atencion editorial</strong>
              </div>

              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label>
                    Tu Nombre completo *
                    <input
                      type="text"
                      required
                      placeholder="Ej. Ana Morales"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Correo electronico de contacto *
                    <input
                      type="email"
                      required
                      placeholder="nombre@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Motivo de la comunicacion *
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="publicar">Difundir una nueva convocatoria</option>
                      <option value="reporte">Reportar enlace o fecha vencida</option>
                      <option value="consulta">Consulta o sugerencia de postulante</option>
                      <option value="alianza">Alianza institucional o prensa</option>
                    </select>
                  </label>
                  <label>
                    Entidad o Empresa (Opcional)
                    <input
                      type="text"
                      placeholder="Ej. SUNAT, BCP, Municipalidad..."
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    />
                  </label>
                </div>

                <label>
                  Enlace o fuente oficial (Opcional pero recomendado)
                  <input
                    type="url"
                    placeholder="https://www.gob.pe/... o enlace a bases"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  />
                </label>

                <label>
                  Mensaje o detalle de la convocatoria *
                  <textarea
                    required
                    rows={4}
                    placeholder="Escribe los detalles de tu consulta, enlace a bases o la correccion que necesitas solicitar..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </label>

                <button className="button-primary" type="submit">
                  Enviar mensaje al equipo editorial
                </button>
              </form>
            </>
          )}
        </section>

        <aside className="admin-side">
          <article className="admin-card">
            <p className="eyebrow">Canales Directos</p>
            <h2>Informacion de contacto</h2>
            <div style={{ display: "grid", gap: "14px", marginTop: "10px" }}>
              <div>
                <strong>Correo Editorial</strong>
                <p style={{ margin: "2px 0 0", color: "var(--primary)", fontWeight: 700 }}>
                  contacto@convocaperu.pe
                </p>
              </div>
              <div>
                <strong>Horario Editorial</strong>
                <p style={{ margin: "2px 0 0", fontSize: "0.9rem" }}>
                  Lunes a Viernes: 8:30 AM a 6:00 PM (Hora de Lima, Peru)
                </p>
              </div>
              <div>
                <strong>Comunidad de Postulantes</strong>
                <p style={{ margin: "2px 0 0", fontSize: "0.9rem" }}>
                  Alertas diarias verificadas via canal oficial.
                </p>
              </div>
            </div>
          </article>

          <article className="admin-card">
            <p className="eyebrow">Transparencia</p>
            <h2>Preguntas Frecuentes</h2>
            <div style={{ display: "grid", gap: "12px", marginTop: "8px" }}>
              <div>
                <strong style={{ fontSize: "0.9rem" }}>¿Tiene costo publicar convocatorias?</strong>
                <p style={{ fontSize: "0.85rem", margin: "4px 0 0" }}>
                  No. Difundimos oportunidades laborales y de practicas de manera 100% gratuita para
                  instituciones oficiales y postulantes.
                </p>
              </div>
              <div>
                <strong style={{ fontSize: "0.9rem" }}>¿Convoca Peru realiza contrataciones?</strong>
                <p style={{ fontSize: "0.85rem", margin: "4px 0 0" }}>
                  No. Somos un portal informativo y de difusion. Cada postulacion se realiza
                  directamente en el portal oficial de la entidad convocante.
                </p>
              </div>
            </div>
          </article>
        </aside>
      </div>
    </main>
  );
}
