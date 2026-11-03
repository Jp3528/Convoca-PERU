import Link from "next/link";
import type { Discovery } from "@/lib/import-types";
import { formatDate } from "@/lib/data";
import { Icon } from "./Icon";
import { SaveButton } from "./SavedOpportunities";
import { ShareButton } from "./ShareButton";
import { discoveryKey } from "@/lib/discoveries";
import { DeadlineBadge } from "./DeadlineBadge";
import { opportunityType } from "@/lib/job-view";
export function DiscoveryCard({ discovery: c }: { discovery: Discovery }) {
  const href = "/descubiertas/" + c.id;
  return (
    <article className="discovery-card professional-job-card">
      <div className="job-card-top">
        <span className="job-card-company-symbol">
          <Icon name="building" size={24} />
        </span>
        <div>
          <strong>{c.organization}</strong>
          <span>
            {c.reference} · {opportunityType(c.type || "CAS")}
          </span>
        </div>
        <SaveButton slug={discoveryKey(c)} />
      </div>
      <DeadlineBadge
        endsAt={c.endsAt}
        startsAt={c.startsAt}
        availability={c.availability}
      />
      <h3>
        <Link href={href}>{c.title}</Link>
      </h3>
      <p className="job-card-location">
        <Icon name="pin" size={16} />
        {c.location || "Ubicación: consulta el perfil"}
      </p>
      <p className="job-card-description">
        {c.details?.summary ||
          "Consulta el perfil del puesto, sus requisitos y las instrucciones para postular en la fuente oficial."}
      </p>
      <p className="job-card-audience">
        <strong>Dirigido a:</strong>{" "}
        {c.details?.audience ||
          "Postulantes que cumplan el perfil de las bases."}
      </p>
      <dl className="job-card-facts">
        <div>
          <dt>Remuneración mensual</dt>
          <dd>{c.details?.stipend || "Por confirmar"}</dd>
        </div>
        <div>
          <dt>Vacantes</dt>
          <dd>
            {c.details?.vacancies
              ? String(c.details.vacancies).padStart(2, "0")
              : "Ver perfil"}
          </dd>
        </div>
      </dl>
      <div className="job-card-window">
        <Icon name="clock" size={16} />
        <span>
          <strong>Postulaciones</strong>
          <br />
          <time dateTime={c.startsAt}>{formatDate(c.startsAt)}</time> al{" "}
          <time dateTime={c.endsAt}>{formatDate(c.endsAt)}</time>
        </span>
      </div>
      <div className="job-card-footer">
        <Link className="button-primary" href={href}>
          Ver perfil y cómo postular <Icon name="arrow" size={17} />
        </Link>
        <ShareButton title={c.title} url={href} compact />
      </div>
      <small className="job-card-source">
        Fuente oficial · Datos extraídos; verifica las bases.
      </small>
    </article>
  );
}
