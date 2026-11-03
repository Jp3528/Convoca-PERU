import type { JobDetails } from "./job-details";
import { safeOfficialDocument } from "./job-links";
export const PROFILE_EXTRACTOR_VERSION = 2;
const compact = (s: string, max: number) =>
  s.replace(/\s+/g, " ").trim().slice(0, max);
// Public projection: no raw HTML, document bytes, hashes or internal job state.
export function publicJobDetails(
  value: JobDetails | undefined,
  now = new Date(),
): JobDetails | undefined {
  if (
    !value ||
    value.extractorVersion !== PROFILE_EXTRACTOR_VERSION ||
    !Number.isFinite(Date.parse(value.checkedAt)) ||
    now.getTime() - Date.parse(value.checkedAt) > 48 * 3600000 ||
    Date.parse(value.checkedAt) > now.getTime() + 60000
  )
    return undefined;
  const list = (values: unknown) =>
    Array.isArray(values)
      ? values
          .filter((s): s is string => typeof s === "string")
          .slice(0, 6)
          .map((s) => compact(s, 500))
      : [];
  const documents = Array.isArray(value.documents)
    ? value.documents
        .flatMap((doc) => {
          const url =
            typeof doc?.url === "string" ? safeOfficialDocument(doc.url) : null;
          return url && typeof doc.label === "string"
            ? [{ label: compact(doc.label, 100), url }]
            : [];
        })
        .slice(0, 6)
    : [];
  return {
    summary:
      typeof value.summary === "string"
        ? compact(value.summary, 500)
        : undefined,
    audience:
      typeof value.audience === "string"
        ? compact(value.audience, 500)
        : undefined,
    stipend:
      typeof value.stipend === "string"
        ? compact(value.stipend, 100)
        : undefined,
    contractDuration:
      typeof value.contractDuration === "string"
        ? compact(value.contractDuration, 180)
        : undefined,
    area: typeof value.area === "string" ? compact(value.area, 180) : undefined,
    vacancies:
      Number.isInteger(value.vacancies) &&
      value.vacancies! > 0 &&
      value.vacancies! < 10000
        ? value.vacancies
        : undefined,
    applicationEmail:
      typeof value.applicationEmail === "string" &&
      /^convocatorias(?:cap|cas)@[a-z.]*proinversion\.gob\.pe$/i.test(
        value.applicationEmail,
      )
        ? value.applicationEmail
        : undefined,
    requirements: list(value.requirements),
    responsibilities: list(value.responsibilities),
    documents,
    checkedAt: value.checkedAt,
  };
}
