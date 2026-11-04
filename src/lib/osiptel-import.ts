import "server-only";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { importSources, type ImportCandidate } from "./import-types";
import { robotsAllows } from "./import-parser";
import { publicBytes, officialProfileText } from "./import-enrichment";
import {
  safeOfficialDocument,
  parseOfficialProfile,
  type JobDocument,
} from "./job-details";
import { PROFILE_EXTRACTOR_VERSION } from "./job-public";

const origin = "https://www.osiptel.gob.pe";
const compact = (text: string) => text.replace(/\s+/g, " ").trim();
function pageUrl(raw: string) {
  const url = new URL(raw, origin);
  if (
    url.origin !== origin ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !/^\/convocatorias-laborales\/cas-n-[a-z0-9áéíóúñ-]+\/$/i.test(
      decodeURIComponent(url.pathname),
    )
  )
    throw new Error("La ficha no pertenece al portal autorizado de OSIPTEL.");
  return url.href;
}
export function parseOsiptelListing(html: string) {
  const $ = load(html);
  const table = $("table")
    .filter((_, el) => /CAS N[°º]/i.test($(el).find("th").text()))
    .first();
  if (!/VIGENTE CAS/i.test($("h1").text()) || !table.length)
    throw new Error("El listado de OSIPTEL cambió de formato.");
  const rows = table
    .find("tr")
    .filter((_, el) => $(el).children("td").length > 0);
  if (rows.length > 12)
    throw new Error("El listado supera el límite de perfiles por consulta.");
  const entries = new Map<
    string,
    { reference: string; title: string; sourceUrl: string }
  >();
  rows.each((_, el) => {
    const cells = $(el).children("td");
    const code = compact(cells.eq(0).text());
    const title = compact(cells.eq(1).text());
    if (
      cells.length !== 3 ||
      !/^\d{3}-\d{4}$/.test(code) ||
      title.length < 8 ||
      title.length > 220
    )
      throw new Error("Hay una fila incompleta en OSIPTEL.");
    const sourceUrl = pageUrl(
      cells.eq(2).find("a.btn_abrir").attr("href") || "",
    );
    if (!sourceUrl.includes(`/cas-n-${code}-`))
      throw new Error("La referencia no coincide con su ficha.");
    const entry = { reference: `CAS ${code}`, title, sourceUrl };
    if (
      entries.has(code) &&
      JSON.stringify(entries.get(code)) !== JSON.stringify(entry)
    )
      throw new Error("OSIPTEL repite una referencia con datos diferentes.");
    entries.set(code, entry);
  });
  return [...entries.values()];
}
export function osiptelDocuments(html: string) {
  const $ = load(html);
  const documents: JobDocument[] = [];
  const table = $("table")
    .filter((_, el) => /Descripción\s*Archivo/i.test($(el).find("th").text()))
    .first();
  table.find("tr").each((_, el) => {
    const label = compact($(el).children("td").first().text());
    if (!label) return;
    const raw = $(el).find("a[href]").first().attr("href");
    if (!raw) return;
    const url = safeOfficialDocument(new URL(raw, origin).href);
    if (!url || new URL(url).origin !== origin)
      throw new Error("El documento no pertenece a OSIPTEL.");
    documents.push({
      label: /bases del concurso/i.test(label)
        ? "Bases del concurso"
        : "Perfil y cronograma",
      url,
    });
  });
  return documents.slice(0, 6);
}
export function parseOsiptelProfile(text: string, reference: string) {
  const flat = compact(text);
  const code = reference.replace(/^CAS /, "");
  if (
    !flat.includes(`CAS N°${code}-OSIPTEL`) &&
    !flat.includes(`CAS N° ${code}-OSIPTEL`)
  )
    throw new Error("El perfil no corresponde a la convocatoria.");
  const calendar = flat.split(/V\.\s*CRONOGRAMA/i)[1];
  const row = calendar?.match(
    /POSTULACI[ÓO]N\s*:(.+?)(?=EVALUACI[ÓO]NE?S)/i,
  )?.[1];
  if (!row)
    throw new Error("No se identificó el plazo de postulación de OSIPTEL.");
  const dates = [...row.matchAll(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g)].map(
    (m) => `${m[3]}-${m[2]}-${m[1]}`,
  );
  if (
    !dates.length ||
    dates.length > 2 ||
    dates.some(
      (date) =>
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date,
    )
  )
    throw new Error("El cronograma de postulación no contiene fechas válidas.");
  const startsAt = dates[0],
    endsAt = dates.at(-1)!;
  if (startsAt > endsAt)
    throw new Error("El periodo de postulación no es válido.");
  const section = (from: RegExp, to: RegExp, max = 480) => {
    const match = from.exec(flat);
    if (!match) return "";
    const rest = flat.slice(match.index + match[0].length);
    const stop = to.exec(rest);
    return stop ? rest.slice(0, stop.index).trim().slice(0, max) : "";
  };
  const audience = section(
    /Formación Académica, grado académico y\/o nivel de estudios/i,
    /Cursos y Programas/i,
  );
  const experience = section(
    /Experiencia\s+Experiencia General:/i,
    /Competencias\/habilidades/i,
  );
  const training = section(
    /Cursos y Programas de especialización requeridos y sustentados con documentos\./i,
    /Conocimientos técnicos para el puesto:/i,
  );
  const summary = section(/Objeto de la Convocatoria:/i, /2\.\s*Dependencia/i);
  const functions = section(
    /Principales funciones a desarrollar:/i,
    /IV\.\s*-?\s*CONDICIONES/i,
    8000,
  );
  const salary = parseOfficialProfile(text).stipend;
  const vacancies =
    Number(flat.match(/\((\d{1,3}) VACANTE[S]?\)/i)?.[1]) || undefined;
  return {
    startsAt,
    endsAt,
    location:
      section(
        /Lugar de prestación del servicio/i,
        /Duración del contrato/i,
        180,
      ) || undefined,
    facts: {
      summary: summary || undefined,
      audience: audience || undefined,
      stipend: salary,
      vacancies,
      requirements: [
        audience && `Formación: ${audience}`,
        experience && `Experiencia general: ${experience}`,
        training && `Capacitación: ${training}`,
      ].filter((value): value is string => !!value),
      responsibilities: functions
        .split(/(?:^|\s)\d{1,2}\)\s+/)
        .filter(Boolean)
        .slice(0, 4)
        .map((item) => item.slice(0, 480)),
    },
  };
}
export async function osiptelCandidates(
  html: string,
  robots: string,
  checkedAt: string,
): Promise<ImportCandidate[]> {
  const source = importSources.find((item) => item.id === "osiptel-cas")!;
  const candidates: ImportCandidate[] = [];
  const deadline = Date.now() + 25000;
  for (const entry of parseOsiptelListing(html)) {
    if (Date.now() > deadline)
      throw new Error(
        "OSIPTEL superó el tiempo de consulta. Se conservan los datos anteriores.",
      );
    if (!robotsAllows(robots, new URL(entry.sourceUrl).pathname))
      throw new Error("La ficha no permite la consulta automática.");
    const documents = osiptelDocuments(
      (await publicBytes(entry.sourceUrl, "html")).toString("utf8"),
    );
    const profile = documents.find(
      (doc) => doc.label === "Perfil y cronograma",
    );
    if (!profile || !robotsAllows(robots, new URL(profile.url).pathname))
      throw new Error("El perfil oficial no está disponible para consulta.");
    const { startsAt, endsAt, facts, location } = parseOsiptelProfile(
      await officialProfileText(await publicBytes(profile.url, "pdf")),
      entry.reference,
    );
    const listing = {
      ...entry,
      sourceId: source.id,
      organization: source.organization,
      startsAt,
      endsAt,
      location,
      type: "CAS" as const,
    };
    const fingerprint = createHash("sha256")
      .update(JSON.stringify({ ...listing, facts, documents }))
      .digest("hex");
    candidates.push({
      ...listing,
      fingerprint,
      firstSeenAt: checkedAt,
      lastCheckedAt: checkedAt,
      parserVersion: "osiptel-cas-v1",
      details: {
        ...facts,
        documents,
        extractorVersion: PROFILE_EXTRACTOR_VERSION,
        checkedAt,
        listingFingerprint: fingerprint,
      },
    });
  }
  return candidates;
}
