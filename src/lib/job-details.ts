import { load } from "cheerio";
import { safeOfficialDocument } from "./job-links";
export { safeOfficialDocument } from "./job-links";

export type JobDocument = { label: string; url: string };
export type JobDetails = {
  extractorVersion?: number;
  summary?: string;
  audience?: string;
  requirements: string[];
  responsibilities: string[];
  stipend?: string;
  vacancies?: number;
  contractDuration?: string;
  area?: string;
  applicationEmail?: string;
  documents: JobDocument[];
  checkedAt: string;
  listingFingerprint?: string;
};

const compact = (text: string, max = 500) => {
  const value = text.replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  return (
    cut.slice(
      0,
      cut.lastIndexOf(" ") > max * 0.75 ? cut.lastIndexOf(" ") : cut.length,
    ) + "…"
  );
};

export function parseOfficialDetailPage(html: string) {
  const $ = load(html);
  const documents: JobDocument[] = [];
  const seen = new Set<string>();
  $("a[href]").each((_, el) => {
    const label = compact($(el).text(), 100);
    const url = safeOfficialDocument($(el).attr("href") || "");
    if (
      url &&
      new URL(url).origin === "https://www.investinperu.pe" &&
      label &&
      /bases|perfil|cronograma|ficha.*postula/i.test(label) &&
      !seen.has(url)
    ) {
      documents.push({ label, url });
      seen.add(url);
    }
  });
  const areaHeading = $("h1,h2,h3,h4")
    .filter((_, el) => /[áa]rea solicitante/i.test($(el).text()))
    .first();
  const area = compact(
    areaHeading
      .parent()
      .text()
      .replace(/[áa]rea solicitante/i, ""),
    180,
  );
  return { documents: documents.slice(0, 6), area: area || undefined };
}

export function parseOfficialProfile(text: string): Partial<JobDetails> {
  const lines = text.replace(/\r/g, "");
  const flat = compact(lines, 60000);
  function between(start: RegExp, end: RegExp, max = 500) {
    const match = start.exec(lines);
    if (!match) return "";
    const rest = lines.slice(match.index + match[0].length);
    const stop = end.exec(rest);
    return compact(stop ? rest.slice(0, stop.index) : "", max);
  }
  const summary = between(
    /I\.\s*OBJETIVO DEL PUESTO\s*/i,
    /II\.\s*FUNCIONES/i,
    450,
  );
  const audience = between(
    /A\.\s*FORMA(?:C|CI)[ÓO]N ACAD[ÉE]MICA\s*/i,
    /B\.\s*EXPERIENCIA/i,
    400,
  );
  const general = between(
    /Experiencia General\s*/i,
    /Experiencia Espec[íi]fica/i,
    300,
  );
  const specific = between(
    /Experiencia Espec[íi]fica\s*/i,
    /C\.\s*CAPACITACIONES/i,
    300,
  );
  const experience = between(
    /B\.\s*EXPERIENCIA(?:\s+PROFESIONAL)?\s*/i,
    /C\.\s*CAPACITACIONES/i,
    700,
  );
  const training = between(
    /C\.\s*CAPACITACIONES\s*/i,
    /D\.\s*CONOCIMIENTOS/i,
    400,
  );
  const knowledge = between(
    /D\.\s*CONOCIMIENTOS\s*:?/i,
    /E\.\s*HABILIDADES|IV\./i,
    400,
  );
  const functions = between(
    /II\.\s*FUNCIONES ESPEC[ÍI]FICAS\s*:?/i,
    /III\.\s*PERFIL/i,
    5000,
  );
  const responsibilities = functions
    .split(/(?:^|\s)\d{1,2}\.\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((s) => compact(s, 320));
  const requirements = [
    audience && "Formación: " + audience,
    general && "Experiencia general: " + general,
    specific && "Experiencia específica: " + specific,
    !general && !specific && experience && "Experiencia: " + experience,
    training && "Capacitación: " + training,
    knowledge && "Conocimientos: " + knowledge,
  ].filter((s): s is string => !!s);
  // PDFs may separate thousands with spaces (13 364.19). Never stop at '13'.
  const salary = flat.match(
    /Remuneraci[oó]n(?:\s+mensual)?\s*:?\s*(?:S\s*\/\.?\s*)?(S\s*\/\.?\s*\d+(?:[.,]\d+|\s\d{3}(?!\d))*)/i,
  )?.[1];
  const count = flat.match(
    /N[úu]mero de (?:puestos vacantes|vacantes|plazas)\s*:?\s*(\d{1,4})/i,
  )?.[1];
  const vacancies = count && Number(count) > 0 ? Number(count) : undefined;
  const duration = flat.match(
    /Tipo de Contrato\s*:\s*(.{5,150}?)(?=R[ée]gimen Laboral|Remuneraci[oó]n)/i,
  )?.[1];
  const email = flat.match(
    /convocatorias(?:cap|cas)@[a-z.]*proinversion\.gob\.pe/i,
  )?.[0];
  return {
    ...(summary ? { summary } : {}),
    ...(audience ? { audience } : {}),
    requirements,
    responsibilities,
    ...(salary ? { stipend: compact(salary, 80) } : {}),
    ...(vacancies ? { vacancies } : {}),
    ...(duration ? { contractDuration: compact(duration, 150) } : {}),
    ...(email ? { applicationEmail: email.toLowerCase() } : {}),
  };
}
