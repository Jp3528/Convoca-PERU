import type { Discovery } from "./import-types";
import type { Opportunity } from "./data";
import { daysUntil } from "./data";
import type { JobDocument } from "./job-details";

export type JobView = {
  key: string;
  href: string;
  title: string;
  organization: string;
  type: string;
  reference?: string;
  location: string;
  summary: string;
  audience: string;
  requirements: string[];
  responsibilities: string[];
  steps: string[];
  stipend?: string;
  vacancies?: number;
  modality?: string;
  startsAt?: string;
  endsAt: string;
  contractDuration?: string;
  applicationCost?: string;
  documents: JobDocument[];
  applicationEmail?: string;
  sourceUrl: string;
  checkedAt?: string;
  availability: Discovery["availability"];
  reviewed: boolean;
  sample?: boolean;
};
export function opportunityType(type: string) {
  return (
    (
      {
        Preprofesional: "Prácticas preprofesionales",
        Profesional: "Prácticas profesionales",
        CAS: "Contrato CAS",
        Empleo: "Empleo",
      } as Record<string, string>
    )[type] || type
  );
}
export function discoveryView(c: Discovery): JobView {
  return {
    key: "hallazgo-" + c.id,
    href: "/descubiertas/" + c.id,
    title: c.title,
    organization: c.organization,
    type: opportunityType(c.type || "CAS"),
    reference: c.reference,
    location: c.location || "Ubicación pendiente de confirmar",
    summary:
      c.details?.summary ||
      `${c.organization} publica el proceso ${c.reference} para el puesto de ${c.title}. Consulta el perfil oficial para comprobar las funciones y condiciones del puesto.`,
    audience:
      c.details?.audience ||
      "Postulantes que acrediten la formación y experiencia exigidas en el perfil oficial. Estos requisitos todavía no se han identificado en la extracción.",
    requirements: c.details?.requirements || [],
    responsibilities: c.details?.responsibilities || [],
    steps: [
      "Lee el perfil y las bases adjuntas. Comprueba los requisitos mínimos, las fechas de cada etapa y el formato de presentación.",
      "Prepara la ficha y los documentos que exija la entidad. Comprueba firmas, anexos, nombres de archivos y tamaño permitido antes de enviarlos.",
      c.details?.applicationEmail
        ? `El cronograma indica la presentación de la ficha por correo a ${c.details.applicationEmail}. Confirma el asunto, las firmas y el formato en las bases; la entrega del CV documentado puede corresponder a una etapa posterior.`
        : "Accede al portal oficial para confirmar el canal de postulación. No se ha identificado un enlace de inscripción independiente para este proceso.",
      "Conserva el comprobante de envío y revisa en la entidad los resultados, las comunicaciones y posibles cambios del cronograma.",
    ],
    stipend: c.details?.stipend,
    vacancies: c.details?.vacancies,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    contractDuration: c.details?.contractDuration,
    documents: c.details?.documents || [],
    applicationEmail: c.details?.applicationEmail,
    sourceUrl: c.sourceUrl,
    checkedAt: c.details?.checkedAt || c.lastCheckedAt,
    availability: c.availability,
    reviewed: false,
  };
}
export function editorialView(o: Opportunity): JobView {
  return {
    key: o.slug,
    href: "/convocatorias/" + o.slug,
    title: o.title,
    organization: o.organization,
    type: opportunityType(o.type),
    location: [o.department, o.province !== o.department ? o.province : ""]
      .filter(Boolean)
      .join(", "),
    summary: o.summary,
    audience: o.audience || o.careers.join(" · "),
    requirements: o.requirements,
    responsibilities: o.responsibilities || [],
    steps: o.steps,
    stipend: o.stipend,
    vacancies: o.vacancies,
    modality: o.modality,
    startsAt: o.startsAt,
    endsAt: o.endsAt,
    contractDuration: o.contractDuration,
    applicationCost: o.applicationCost,
    documents: [],
    sourceUrl: o.sourceUrl,
    availability:
      daysUntil(o.endsAt) < 0
        ? "closed"
        : o.startsAt && daysUntil(o.startsAt) > 0
          ? "upcoming"
          : "open",
    reviewed: true,
    sample: o.isSample,
  };
}
