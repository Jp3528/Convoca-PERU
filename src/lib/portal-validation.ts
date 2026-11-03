import { randomUUID } from "node:crypto";
import { daysUntil, departments, type Article, type Opportunity } from "./data";
import type { Message, PortalRecord } from "./portal-types";
export function text(value: unknown, max = 300) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function required(value: unknown, label: string, min = 1, max = 300) {
  const result = text(value, max);
  if (result.length < min)
    throw new Error(
      "Completa " +
        label +
        (min > 1 ? " con al menos " + min + " caracteres." : "."),
    );
  return result;
}
function list(value: unknown) {
  return (Array.isArray(value) ? value : String(value || "").split("\n"))
    .map((v) => text(v, 1500))
    .filter(Boolean)
    .slice(0, 40);
}
function url(value: unknown) {
  const raw = text(value, 1500);
  try {
    const parsed = new URL(raw);
    if (
      parsed.protocol !== "https:" ||
      !parsed.hostname.includes(".") ||
      /^(localhost|127\.|10\.|192\.168\.)/.test(parsed.hostname)
    )
      throw new Error();
    return parsed.toString();
  } catch {
    throw new Error(
      "La fuente debe ser una dirección HTTPS pública de la entidad.",
    );
  }
}
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
function date(value: unknown) {
  const raw = text(value, 10);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(raw) ||
    !Number.isFinite(Date.parse(raw + "T00:00:00Z")) ||
    new Date(raw + "T00:00:00Z").toISOString().slice(0, 10) !== raw
  )
    throw new Error("La fecha de cierre no es válida.");
  return raw;
}
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 130);
}
export function contentRecord(
  input: Record<string, unknown>,
  previous?: PortalRecord,
): PortalRecord {
  const kind = input.kind === "article" ? "article" : "opportunity";
  if (previous && previous.kind !== kind)
    throw new Error("No se puede cambiar el tipo de contenido.");
  const source = input.payload as Record<string, unknown>;
  if (!source || typeof source !== "object")
    throw new Error("Faltan los datos del contenido.");
  const title = required(source.title, "el título", 8, 220);
  const slug = previous?.slug || slugify(text(source.slug) || title);
  if (!slug) throw new Error("El título necesita una dirección válida.");
  const status =
    input.status === "published"
      ? "published"
      : input.status === "archived"
        ? "archived"
        : "draft";
  const sample = previous?.sample ?? false;
  const verified = input.verified === true;
  const publishedAt = previous
    ? (previous.payload as Opportunity | Article).publishedAt
    : today();
  let payload: Opportunity | Article;
  if (kind === "article") {
    const body = list(source.body);
    payload = {
      slug,
      title,
      description: required(source.description, "la descripción", 50, 500),
      category: required(source.category, "la categoría"),
      readTime:
        Math.max(1, Math.ceil(body.join(" ").split(/\s+/).length / 200)) +
        " min",
      publishedAt,
      body,
    };
    if (status === "published" && body.join(" ").length < 500)
      throw new Error(
        "Desarrolla la guía antes de publicarla: añade explicaciones y ejemplos propios.",
      );
  } else {
    const type = text(source.type) as Opportunity["type"];
    const sector = text(source.sector) as Opportunity["sector"];
    const modality = text(source.modality) as Opportunity["modality"];
    if (
      !["Preprofesional", "Profesional", "Empleo", "CAS"].includes(type) ||
      !["Publico", "Privado"].includes(sector) ||
      !["Presencial", "Hibrido", "Remoto"].includes(modality) ||
      !departments.includes(text(source.department))
    )
      throw new Error("Revisa el tipo, sector, departamento y modalidad.");
    const vacancies = Number(source.vacancies);
    if (!Number.isInteger(vacancies) || vacancies < 1 || vacancies > 100000)
      throw new Error("El número de vacantes debe ser un entero positivo.");
    payload = {
      ...((previous?.payload as Opportunity | undefined)?.importProvenance
        ? {
            importProvenance: (previous!.payload as Opportunity)
              .importProvenance,
          }
        : {}),
      slug,
      title,
      organization: required(source.organization, "la entidad"),
      sector,
      type,
      department: text(source.department),
      province: text(source.province),
      modality,
      vacancies,
      careers: list(source.careers),
      startsAt: source.startsAt ? date(source.startsAt) : undefined,
      audience: text(source.audience, 1500) || undefined,
      contractDuration: text(source.contractDuration, 300) || undefined,
      applicationCost: text(source.applicationCost, 300) || undefined,
      responsibilities: list(source.responsibilities),
      endsAt: date(source.endsAt),
      stipend: required(
        source.stipend,
        "la remuneración o la referencia a las bases",
      ),
      summary: required(source.summary, "el resumen", 80, 2500),
      requirements: list(source.requirements),
      steps: list(source.steps),
      sourceName: required(
        source.sourceName || source.organization,
        "el nombre de la fuente",
      ),
      sourceUrl: url(source.sourceUrl),
      publishedAt,
      featured: source.featured === true,
    };
    if (payload.startsAt && payload.startsAt > payload.endsAt)
      throw new Error("El inicio de postulaciones no puede ser posterior al cierre.");
    if (
      status === "published" &&
      (daysUntil(payload.endsAt) < 0 ||
        !payload.careers.length ||
        !payload.requirements.length ||
        !payload.steps.length)
    )
      throw new Error(
        "Para publicar, completa carreras, requisitos, pasos y una fecha de cierre vigente.",
      );
  }
  if (status === "published" && !sample && !verified)
    throw new Error(
      "Revisa la fuente y marca la verificación editorial antes de publicar.",
    );
  const now = new Date().toISOString();
  return {
    id: previous?.id || randomUUID(),
    kind,
    slug,
    payload,
    status,
    sample,
    verified,
    created_at: previous?.created_at || now,
    updated_at: now,
    revision: (previous?.revision || 0) + 1,
  };
}
export function contactRecord(input: Record<string, unknown>): PortalRecord {
  const email = required(input.email, "el correo", 3, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Escribe un correo válido.");
  const payload: Message = {
    name: required(input.name, "tu nombre", 2, 120),
    email,
    subject: required(input.subject, "el motivo"),
    organization: text(input.organization),
    sourceUrl: text(input.sourceUrl, 1500),
    message: required(input.message, "el mensaje", 20, 5000),
    resolved: false,
  };
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    kind: "message",
    slug: "",
    payload,
    status: "draft",
    verified: false,
    sample: false,
    created_at: now,
    updated_at: now,
    revision: 1,
  };
}
