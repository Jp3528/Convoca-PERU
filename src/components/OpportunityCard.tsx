import Link from "next/link";
import { daysUntil, formatDate, type Opportunity } from "@/lib/data";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const remaining = daysUntil(opportunity.endsAt);
  const status =
    remaining < 0
      ? "Finalizada"
      : remaining === 0
        ? "Cierra hoy"
        : `${remaining} dias restantes`;

  return (
    <article className="opportunity-card">
      <div className="card-topline">
        <span className="vacancies">{opportunity.vacancies} vacantes</span>
        <span className={`sector sector-${opportunity.sector.toLowerCase()}`}>
          {opportunity.sector}
        </span>
        <span className="verified-pill">Fuente revisada</span>
      </div>
      <p className="card-organization">{opportunity.organization}</p>
      <div>
        <p className="eyebrow">{opportunity.type}</p>
        <h3>
          <Link href={`/convocatorias/${opportunity.slug}`}>
            {opportunity.title}
          </Link>
        </h3>
      </div>
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
          <dt>Finaliza</dt>
          <dd>{formatDate(opportunity.endsAt)}</dd>
        </div>
      </dl>
      <p className="summary">{opportunity.summary}</p>
      <div className="career-list">
        {opportunity.careers.slice(0, 4).map((career) => (
          <span key={career}>{career}</span>
        ))}
        {opportunity.careers.length > 4 ? (
          <span>+{opportunity.careers.length - 4} mas</span>
        ) : null}
      </div>
      <div className="card-actions">
        <span className="deadline">{status}</span>
        <Link className="text-link" href={`/convocatorias/${opportunity.slug}`}>
          Ver convocatoria
        </Link>
      </div>
    </article>
  );
}
