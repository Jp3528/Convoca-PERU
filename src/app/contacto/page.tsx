import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
export const metadata: Metadata = { title: "Contacto y consultas" };
export default async function Contact({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const value = (await searchParams).convocatoria;
  const report = typeof value === "string" ? value.slice(0, 300) : "";
  return (
    <main id="contenido" className="page-shell">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <span aria-current="page">Contacto</span>
      </nav>
      <header className="page-header">
        <p className="eyebrow">TE LEEMOS</p>
        <h1>Hagamos que buscar sea más fácil.</h1>
        <p>
          Prepara una consulta, comparte una sugerencia o reporta información
          que necesita revisión.
        </p>
      </header>
      <div className="admin-grid">
        <section className="admin-card">
          <ContactForm key={report} report={report} />
        </section>
        <aside className="admin-side">
          <article className="admin-card">
            <p className="eyebrow">ANTES DE ESCRIBIR</p>
            <h2>Estamos para orientarte.</h2>
            <p>
              Convoca Perú organiza información y enlaza a las entidades. El
              proceso de selección y las consultas sobre resultados se gestionan
              con cada institución.
            </p>
            <Link className="text-link" href="/convocatorias">
              Consultar convocatorias →
            </Link>
          </article>
          <article className="admin-card contact-faq">
            <p className="eyebrow">DUDAS FRECUENTES</p>
            <h2>Respuestas rápidas.</h2>
            <details>
              <summary>¿Dónde envío mi CV?</summary>
              <p>
                En el portal de la entidad que convoca. Revisa el enlace
                incluido en la ficha; no envíes tus documentos por este
                formulario.
              </p>
            </details>
            <details>
              <summary>¿Puedo difundir una convocatoria?</summary>
              <p>
                Envíanos la fuente oficial y los detalles mediante este
                formulario. El equipo revisará la propuesta antes de difundirla.
              </p>
            </details>
            <details>
              <summary>¿Puedo recuperar mi consulta?</summary>
              <p>
                Sí. Puedes guardar un borrador en este navegador antes de
                enviarlo. Después del envío recibirás una referencia de
                consulta.
              </p>
            </details>
          </article>
        </aside>
      </div>
    </main>
  );
}
