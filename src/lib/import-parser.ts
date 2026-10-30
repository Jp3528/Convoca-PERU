import { createHash } from "node:crypto";
import { load } from "cheerio";
import type { ImportCandidate } from "./import-types";
import { importSources } from "./import-types";

const clean = (value: string) => value.replace(/\s+/g, " ").trim();
function isoDate(raw: string) {
  const [day, month, year] = raw.split("/");
  const date = `${year}-${month}-${day}`;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(Date.parse(date + "T00:00:00Z")) ||
    new Date(date + "T00:00:00Z").toISOString().slice(0, 10) !== date
  )
    throw new Error(
      "La fuente contiene una fecha inválida. No se guardaron resultados.",
    );
  return date;
}

export function candidateSlug(sourceId: string, reference: string) {
  return (
    "import-" +
    createHash("sha256")
      .update(sourceId + ":" + reference)
      .digest("hex")
      .slice(0, 32)
  );
}

export function parseMtcCas(
  html: string,
  checkedAt = new Date().toISOString(),
): ImportCandidate[] {
  const source = importSources[0];
  const $ = load(html);
  const declared = clean($("#lblCntPas").text()).match(
    /^(\d+) convocatorias?\.$/i,
  );
  const rows = $("tr[id^='rptConvocatoria_trFila_']");
  if (!declared || Number(declared[1]) !== rows.length || rows.length > 100)
    throw new Error(
      "El listado oficial cambió de formato. Revisa la fuente antes de volver a importar.",
    );
  const found = new Map<string, ImportCandidate>();
  rows.each((_, row) => {
    const reference = clean(
      $(row).find("span[id*='_lblConvocatoria_']").text(),
    );
    const title = clean($(row).find("span[id*='_lblDescripcion_']").text());
    const period = clean($(row).find("span[id*='_lblPeriodo_']").text());
    const dates = period.match(
      /^Del (\d{2}\/\d{2}\/\d{4}) al (\d{2}\/\d{2}\/\d{4})$/i,
    );
    if (
      !/^N[º°o.]?\s*\d+-\d{4}-MTC\/\d+$/i.test(reference) ||
      title.length < 8 ||
      title.length > 220 ||
      !dates
    )
      throw new Error(
        "Hay una fila incompleta en la fuente. No se guardaron resultados.",
      );
    const startsAt = isoDate(dates[1]),
      endsAt = isoDate(dates[2]);
    if (startsAt > endsAt)
      throw new Error("El periodo de la fuente no es válido.");
    const canonicalReference = reference.replace(/^N[º°o.]?\s*/i, "");
    const extracted = {
      sourceId: source.id,
      reference: canonicalReference,
      title,
      organization: source.organization,
      sourceUrl: source.url,
      startsAt,
      endsAt,
    };
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(extracted))
      .digest("hex");
    const candidate = {
      ...extracted,
      fingerprint,
      firstSeenAt: checkedAt,
      lastCheckedAt: checkedAt,
      parserVersion: "mtc-cas-v1",
    };
    const previous = found.get(canonicalReference);
    if (previous && previous.fingerprint !== fingerprint)
      throw new Error(
        "La fuente repite un código con datos distintos. Revisa el listado.",
      );
    found.set(canonicalReference, candidate);
  });
  return [...found.values()];
}

function proinversionDates(period: string) {
  const numeric = period.match(
    /^Del (\d{2}\/\d{2}\/\d{4}) al (\d{2}\/\d{2}\/\d{4})$/i,
  );
  if (numeric) return [isoDate(numeric[1]), isoDate(numeric[2])];
  const words = period
    .toLowerCase()
    .match(
      /^del (\d{1,2})(?: de ([a-z]+))? al (\d{1,2}) de ([a-z]+) de (\d{4})$/,
    );
  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  if (!words) throw new Error("El periodo de ProInversión cambió de formato.");
  const endMonth = months.indexOf(words[4]) + 1,
    startMonth = months.indexOf(words[2] || words[4]) + 1;
  if (!endMonth || !startMonth)
    throw new Error("La fecha de ProInversión no es válida.");
  return [
    isoDate(
      `${words[1].padStart(2, "0")}/${String(startMonth).padStart(2, "0")}/${words[5]}`,
    ),
    isoDate(
      `${words[3].padStart(2, "0")}/${String(endMonth).padStart(2, "0")}/${words[5]}`,
    ),
  ];
}

export function parseProinversion(
  html: string,
  checkedAt = new Date().toISOString(),
): ImportCandidate[] {
  const source = importSources[1];
  const $ = load(html),
    cards = $(".jet-listing-grid__item[data-post-id]");
  if (!cards.length || cards.length > 100)
    throw new Error("El listado de ProInversión cambió de formato.");
  const found = new Map<string, ImportCandidate>();
  cards.each((_, card) => {
    const status = clean(
      $(card).find(".jet-listing-dynamic-terms__link").first().text(),
    );
    // The page repeats cards in modal templates, without a status or dates.
    if (!status) return;
    const fields = $(card)
      .find(".jet-listing-dynamic-field__content")
      .map((_, e) => clean($(e).text()))
      .get();
    const reference = fields[0],
      title = fields[1],
      externalId = $(card).attr("data-post-id")!;
    if (/INTERNO/i.test(reference) || status.toLowerCase() !== "vigente")
      return;
    if (
      !/^(CAS|CAP) \d+-\d{4}/.test(reference) ||
      !/^\d+$/.test(externalId) ||
      !title ||
      title.length < 8 ||
      title.length > 220
    )
      throw new Error("Hay una convocatoria incompleta en ProInversión.");
    const boxes = $(card).find(".elementor-icon-box-content");
    const valueFor = (label: string) =>
      clean(
        boxes
          .filter(
            (_, e) =>
              clean($(e).find(".elementor-icon-box-title").text()) === label,
          )
          .first()
          .find(".elementor-icon-box-description")
          .text(),
      );
    const [startsAt, endsAt] = proinversionDates(
      valueFor("Fecha de Postulación"),
    );
    if (startsAt > endsAt)
      throw new Error("El periodo de ProInversión no es válido.");
    const rawUrl = $(card).find("a[href]").first().attr("href") || "";
    const sourceUrl = new URL(rawUrl);
    if (
      sourceUrl.origin !== new URL(source.url).origin ||
      !sourceUrl.pathname.startsWith("/convocatorias-laborales/") ||
      sourceUrl.username ||
      sourceUrl.password
    )
      throw new Error(
        "El enlace de la convocatoria no corresponde a la fuente oficial.",
      );
    const extracted = {
      externalId,
      sourceId: source.id,
      reference,
      title,
      organization: source.organization,
      sourceUrl: sourceUrl.toString(),
      startsAt,
      endsAt,
      type: reference.startsWith("CAS")
        ? ("CAS" as const)
        : ("Empleo" as const),
      location: valueFor("Lugar"),
    };
    const fingerprint = createHash("sha256")
      .update(JSON.stringify(extracted))
      .digest("hex");
    if (
      found.has(externalId) &&
      found.get(externalId)!.fingerprint !== fingerprint
    )
      throw new Error("La fuente repite una plaza con información diferente.");
    found.set(externalId, {
      ...extracted,
      fingerprint,
      firstSeenAt: checkedAt,
      lastCheckedAt: checkedAt,
      parserVersion: "proinversion-v1",
    });
  });
  return [...found.values()];
}

// Select the most specific matching robots group, then the longest matching path.
export function robotsAllows(
  content: string,
  targetPath: string,
  agent = "ConvocaPeruImporter",
) {
  const groups: {
    agents: string[];
    rules: { allow: boolean; path: string }[];
  }[] = [];
  let group = {
    agents: [] as string[],
    rules: [] as { allow: boolean; path: string }[],
  };
  let rulesStarted = false;
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.split("#")[0].trim();
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const key = line.slice(0, colon).trim().toLowerCase(),
      value = line.slice(colon + 1).trim();
    if (key === "user-agent") {
      if (rulesStarted) {
        groups.push(group);
        group = { agents: [], rules: [] };
        rulesStarted = false;
      }
      group.agents.push(value.toLowerCase());
    } else if (key === "allow" || key === "disallow") {
      rulesStarted = true;
      if (value) group.rules.push({ allow: key === "allow", path: value });
    }
  }
  groups.push(group);
  const score = (agents: string[]) =>
    Math.max(
      -1,
      ...agents.map((a) =>
        a === "*" ? 0 : agent.toLowerCase().includes(a) ? a.length : -1,
      ),
    );
  const best = Math.max(...groups.map((g) => score(g.agents)));
  if (best < 0) return true;
  const rules = groups
    .filter((g) => score(g.agents) === best)
    .flatMap((g) => g.rules)
    .filter((rule) => {
      const pattern = rule.path
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/\\\$$/, "$");
      return new RegExp("^" + pattern).test(targetPath);
    })
    .sort(
      (a, b) =>
        b.path.length - a.path.length || Number(b.allow) - Number(a.allow),
    );
  return rules[0]?.allow ?? true;
}
