import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  daysUntil,
  formatDate,
  getOpportunityBySlug,
  opportunities,
} from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export function generateStaticParams() {
  return opportunities.map((opportunity) => ({ slug: opportunity.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);

  if (!opportunity) {
    return {
      title: "Convocatoria no encontrada",
    };
  }

  return {
    title: `${opportunity.organization}: ${opportunity.title}`,
    description: opportunity.summary,
    alternates: {
      canonical: `/convocatorias/${opportunity.slug}`,
    },
  };
}

export default async function OpportunityPage({ params }: Props) {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);

  if (!opportunity) {
    notFound();
  }

  const remaining = daysUntil(opportunity.endsAt);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: `${opportunity.organization}: ${opportunity.title}`,
    description: opportunity.summary,
    datePosted: `${opportunity.publishedAt}T08:00:00-05:00`,
    validThrough: `${opportunity.endsAt}T23:59:59-05:00`,
    employmentType: opportunity.type === "Empleo" ? "FULL_TIME" : "INTERN",
    hiringOrganization: {
      "@type": "Organization",
      name: opportunity.organization,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: opportunity.province ?? opportunity.department,
        addressRegion: opportunity.department,
        addressCountry: "PE",
      },
    },
  };

  return (
    <main className="page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav className="mini-nav" aria-label="Secciones">
        <Link href="/">Inicio</Link>
        <Link href="/convocatorias">Convocatorias</Link>
        <Link href="/blog">Guias</Link>
      </nav>

      <header className="page-header">
        <p className="eyebrow">{opportunity.type}</p>
        <h1>{opportunity.title}</h1>
        <p>{opportunity.summary}</p>
        <div className="detail-meta">
          <span className="vacancies">{opportunity.vacancies} vacantes</span>
          <span className={`sector sector-${opportunity.sector.toLowerCase()}`}>
            {opportunity.sector}
          </span>
          <span className="deadline">
            {remaining < 0
              ? "Convocatoria finalizada"
              : remaining === 0
                ? "Cierra hoy"
                : `${remaining} dias restantes`}
          </span>
        </div>
      </header>

      <section className="detail-layout">
        <article className="detail-card">
          <h2>Datos principales</h2>
          <dl className="card-facts">
            <div>
              <dt>Entidad</dt>
              <dd>{opportunity.organization}</dd>
            </div>
            <div>
              <dt>Ubicacion</dt>
              <dd>
                {opportunity.department}
                {opportunity.province ? `, ${opportunity.province}` : ""}
              </dd>
            </div>
            <div>
              <dt>Modalidad</dt>
              <dd>{opportunity.modality}</dd>
            </div>
            <div>
              <dt>Subvencion</dt>
              <dd>{opportunity.stipend}</dd>
            </div>
            <div>
              <dt>Publicado</dt>
              <dd>{formatDate(opportunity.publishedAt)}</dd>
            </div>
            <div>
              <dt>Cierre</dt>
              <dd>{formatDate(opportunity.endsAt)}</dd>
            </div>
          </dl>

          <h2>Carreras solicitadas</h2>
          <div className="career-list">
            {opportunity.careers.map((career) => (
              <span key={career}>{career}</span>
            ))}
          </div>

          <h2>Requisitos</h2>
          <ul>
            {opportunity.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>

          <h2>Como postular</h2>
          <ul>
            {opportunity.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>

        <aside className="detail-side">
          <div className="source-box">
            <p className="eyebrow">Fuente oficial</p>
            <h3>{opportunity.sourceName}</h3>
            <p>
              Antes de postular, revisa la informacion oficial y valida fechas,
              anexos y requisitos.
            </p>
            <a
              className="button-primary"
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ir a la fuente
            </a>
          </div>
          <div className="source-box">
            <p className="eyebrow">Aviso</p>
            <p>
              Convoca Peru organiza informacion publica y editorial. No cobra
              por postulaciones ni reemplaza las bases oficiales.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
