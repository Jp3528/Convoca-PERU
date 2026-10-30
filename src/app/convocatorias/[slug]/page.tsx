import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { daysUntil, formatDate } from "@/lib/data";
import {
  deadline,
  display,
  initials,
  organizationShort,
  filterOpportunities,
} from "@/lib/search";
import { Icon } from "@/components/Icon";
import { SaveButton } from "@/components/SavedOpportunities";
import { ShareButton } from "@/components/ShareButton";
import { OpportunityCard } from "@/components/OpportunityCard";
import { getCatalog } from "@/lib/portal-store";
import { Advertisement } from "@/components/Advertisement";
type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { opportunities } = await getCatalog();
  const slug = (await params).slug;
  const o = opportunities.find((item) => item.slug === slug);
  return o
    ? {
        title: o.organization + ": " + o.title,
        description: o.summary,
        robots: o.isSample ? { index: false, follow: true } : undefined,
        alternates: { canonical: "/convocatorias/" + o.slug },
      }
    : { title: "Convocatoria no encontrada" };
}
export default async function Detail({ params }: Props) {
  const { opportunities } = await getCatalog();
  const slug = (await params).slug;
  const o = opportunities.find((item) => item.slug === slug);
  if (!o) notFound();
  const closed = daysUntil(o.endsAt) < 0;
  const related = filterOpportunities(
    opportunities.filter((item) => item.slug !== o.slug),
    {},
  )
    .sort((a, b) => Number(b.type === o.type) - Number(a.type === o.type))
    .slice(0, 3);
  return (
    <main id="contenido" className="page-shell">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <Link href="/convocatorias">Convocatorias</Link>
        <span>/</span>
        <span aria-current="page">{organizationShort(o.organization)}</span>
      </nav>
      <div className="detail-layout">
        <div>
          <header className="detail-heading">
            <div className="detail-organization">
              <span className="organization-avatar">
                {initials(o.organization)}
              </span>
              <div>
                <strong>{organizationShort(o.organization)}</strong>
                <span>Sector {display(o.sector).toLowerCase()}</span>
              </div>
            </div>
            <div className="job-tags">
              <span className="type-tag">
                {o.type === "Preprofesional"
                  ? "Prácticas preprofesionales"
                  : o.type === "Profesional"
                    ? "Prácticas profesionales"
                    : o.type}
              </span>
              <span
                className={
                  "deadline " + (closed ? "deadline-closed" : "deadline-active")
                }
              >
                <Icon name="clock" size={15} />
                {deadline(o.endsAt)}
              </span>
            </div>
            <h1>{o.title}</h1>
            <p>{o.summary}</p>
            <div className="detail-quick">
              <span>
                <Icon name="pin" size={17} />
                {display(o.department)}
              </span>
              <span>
                <Icon name="briefcase" size={17} />
                {display(o.modality)}
              </span>
              <span>{o.vacancies} vacantes</span>
            </div>
          </header>
          {o.isSample && (
            <div className="catalog-note">
              <span className="sample-dot" />
              <p>
                <strong>Convocatoria de muestra.</strong> Los requisitos,
                importes y fechas de esta ficha no acreditan una oferta real
                vigente. Confírmalos en el portal de la entidad.
              </p>
            </div>
          )}
          <article className="detail-card">
            <section>
              <h2>Lo esencial de esta oportunidad</h2>
              <dl className="detail-facts">
                {[
                  ["Entidad", o.organization],
                  [
                    "Ubicación",
                    [
                      display(o.department),
                      o.province !== o.department ? o.province : "",
                    ]
                      .filter(Boolean)
                      .join(", "),
                  ],
                  ["Modalidad", display(o.modality)],
                  ["Remuneración o subvención", o.stipend],
                  ["Publicación", formatDate(o.publishedAt)],
                  ["Fecha de cierre", formatDate(o.endsAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section>
              <h2>Carreras solicitadas</h2>
              <div className="career-list">
                {o.careers.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            </section>
            <section>
              <h2>¿Qué necesitas para postular?</h2>
              <ul className="requirements-list">
                {o.requirements.map((r) => (
                  <li key={r}>
                    <Icon name="check" size={18} />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2>Tu ruta de postulación</h2>
              <ol className="application-steps">
                {o.steps.map((s, index) => (
                  <li key={s}>
                    <span>{index + 1}</span>
                    <p>{s}</p>
                  </li>
                ))}
              </ol>
            </section>
          </article>
        </div>
        <aside className="detail-side">
          <div className="source-box">
            <span className="source-icon">
              <Icon name="external" size={25} />
            </span>
            <p className="eyebrow">EL SIGUIENTE PASO</p>
            <h2>
              {closed
                ? "Consulta el portal de la entidad"
                : "Revisa las bases antes de postular"}
            </h2>
            <p>
              {closed
                ? "La fecha de esta convocatoria ya finalizó. Puedes consultar nuevas oportunidades en la entidad."
                : "El proceso se completa en el sitio de la entidad. Revisa allí el cronograma, los anexos y los requisitos."}
            </p>
            <div className="source-deadline">
              <Icon name="clock" size={18} />
              <div>
                <span>Fecha de cierre</span>
                <strong>{formatDate(o.endsAt)}</strong>
              </div>
            </div>
            <a
              className="button-primary"
              href={o.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visitar portal de la entidad <Icon name="external" size={17} />
            </a>
            <SaveButton slug={o.slug} full />
            <ShareButton />
            <small>{o.sourceName}</small>
          </div>
          <div className="safety-note">
            <Icon name="check" size={20} />
            <p>
              <strong>Tu postulación es personal.</strong> Convoca Perú no
              solicita pagos ni recibe documentos para este proceso.
            </p>
          </div>
          <Link
            className="text-link"
            href={"/contacto?convocatoria=" + encodeURIComponent(o.title)}
          >
            Reportar un dato de esta ficha <Icon name="arrow" size={16} />
          </Link>
        </aside>
      </div>
      <Advertisement placement="opportunity" eligible={!o.isSample} />
      <section className="related-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SIGUE EXPLORANDO</p>
            <h2>Otras oportunidades para ti.</h2>
          </div>
          <Link className="text-link" href="/convocatorias">
            Ver todas <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="opportunity-grid">
          {related.map((item) => (
            <OpportunityCard key={item.slug} opportunity={item} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
