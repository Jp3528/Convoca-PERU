import Link from "next/link";
import { daysUntil, formatDate, type Opportunity } from "@/lib/data";
import { deadline, display, initials, organizationShort } from "@/lib/search";
import { Icon } from "./Icon";
import { SaveButton } from "./SavedOpportunities";
export function OpportunityCard({
  opportunity: o,
  compact = false,
}: {
  opportunity: Opportunity;
  compact?: boolean;
}) {
  const closed = daysUntil(o.endsAt) < 0;
  return (
    <article className={"opportunity-card " + (compact ? "card-compact" : "")}>
      <div className="job-top">
        <div
          className={
            "organization-avatar " +
            (o.sector === "Privado" ? "avatar-private" : "")
          }
        >
          {initials(o.organization)}
        </div>
        <div className="job-organization">
          <span>{organizationShort(o.organization)}</span>
          <small>
            {display(o.sector)} · {o.vacancies}{" "}
            {o.vacancies === 1 ? "vacante" : "vacantes"}
          </small>
        </div>
        <SaveButton slug={o.slug} />
      </div>
      <div className="job-tags">
        <span className={"type-tag type-" + o.type.toLowerCase()}>
          {o.type === "Preprofesional"
            ? "Prácticas preprofesionales"
            : o.type === "Profesional"
              ? "Prácticas profesionales"
              : o.type === "CAS"
                ? "Contrato CAS"
                : "Empleo"}
        </span>
        <span className="modality-tag">{display(o.modality)}</span>
      </div>
      <h3>
        <Link href={"/convocatorias/" + o.slug}>{o.title}</Link>
      </h3>
      <div className="job-location">
        <Icon name="pin" size={16} />
        {o.department}
        {o.province && o.province !== o.department ? ", " + o.province : ""}
      </div>
      {!compact && <p className="summary">{o.summary}</p>}
      <p className="job-stipend">{o.stipend}</p>
      <div className="career-list">
        {o.careers.slice(0, compact ? 2 : 3).map((c) => (
          <span key={c}>{c}</span>
        ))}
        {o.careers.length > (compact ? 2 : 3) && (
          <span>+{o.careers.length - (compact ? 2 : 3)}</span>
        )}
      </div>
      <div className="card-actions">
        <span
          className={
            "deadline " + (closed ? "deadline-closed" : "deadline-active")
          }
          title={"Cierre: " + formatDate(o.endsAt)}
        >
          <Icon name="clock" size={15} />
          {deadline(o.endsAt)}
        </span>
        <Link className="text-link" href={"/convocatorias/" + o.slug}>
          Ver detalle <Icon name="arrow" size={17} />
        </Link>
      </div>
    </article>
  );
}
