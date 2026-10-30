import type { Discovery } from "@/lib/import-types";
import { daysUntil, formatDate } from "@/lib/data";
import { Icon } from "./Icon";
import { SaveButton } from "./SavedOpportunities";
import { discoveryKey } from "@/lib/discoveries";

export function DiscoveryCard({ discovery: c }: { discovery: Discovery }) {
  return (
    <article className="discovery-card">
      <div className="import-card-heading">
        <span className="eyebrow">{c.organization}</span>
        <span className="pending-badge">Hallazgo automático</span>
      </div>
      <p className="muted discovery-reference">
        {c.reference} · {c.type === "CAS" ? "Contrato CAS" : "Empleo público"}
      </p>
      <h3>
        <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
          {c.title}
        </a>
      </h3>
      <p>
        <Icon name="pin" size={15} />{" "}
        {c.location || "Ubicación: consulta las bases"}
      </p>
      <p className="discovery-deadline">
        <Icon name="clock" size={15} />{" "}
        {daysUntil(c.startsAt) > 0
          ? "Postulaciones desde " + formatDate(c.startsAt)
          : "Postulaciones según el cronograma oficial"}
      </p>
      <p>
        <strong>Cierre: {formatDate(c.endsAt)}</strong>
      </p>
      <p className="discovery-disclaimer">
        Datos extraídos del listado oficial. Verifica requisitos, vacantes y
        posibles cambios en las bases antes de postular.
      </p>
      <a
        className="text-link"
        href={c.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Consultar convocatoria oficial <Icon name="external" size={16} />
      </a>
      <small>
        Consultado:{" "}
        {new Date(c.lastCheckedAt).toLocaleString("es-PE", {
          timeZone: "America/Lima",
        })}{" "}
        · Lima
      </small>
      <SaveButton slug={discoveryKey(c)} full />
    </article>
  );
}
