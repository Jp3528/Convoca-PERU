import assert from "node:assert/strict";
import { supabaseAuthHeaders } from "../src/lib/supabase-auth.mjs";
assert.deepEqual(supabaseAuthHeaders("sb_secret_local_fixture"), {
  apikey: "sb_secret_local_fixture",
});
assert.equal(
  supabaseAuthHeaders("legacy.fixture.jwt").Authorization,
  "Bearer legacy.fixture.jwt",
);
import fs from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
const load = createRequire(import.meta.url);
load.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    filename,
  );
};
const { daysUntil, formatDate, opportunities } = load("../src/lib/data.ts");
const { filterOpportunities, normalize } = load("../src/lib/search.ts");
const { readApplications, savedApplications, pendingCalendarJobs } = load(
  "../src/lib/saved-applications.ts",
);
const now = new Date("2026-10-28T18:00:00Z");
const summary = {
  key: "sent-archived",
  title: "Puesto archivado",
  organization: "Entidad de prueba",
  endsAt: "2026-10-20",
};
const saved = readApplications(
  JSON.stringify([
    { ...summary, href: "javascript:alert(1)", privateNote: "ignored" },
    { ...summary, key: "invalid-date", endsAt: "2026-02-30" },
    { ...summary, key: "__proto__" },
  ]),
);
assert.deepEqual([...saved.values()], [summary]);
assert.equal(readApplications("[invalid json").size, 0);
const tracker = savedApplications(
  ["later", "expired", "soon", "soon", "sent-archived", "missing"],
  [
    {
      ...summary,
      key: "later",
      endsAt: "2026-11-20",
      href: "/convocatorias/later",
    },
    {
      ...summary,
      key: "soon",
      endsAt: "2026-10-28",
      href: "/convocatorias/soon",
    },
    {
      ...summary,
      key: "expired",
      endsAt: "2026-10-27",
      href: "/convocatorias/expired",
    },
  ],
  saved,
  now,
);
assert.deepEqual(
  tracker.rows.map((row) => row.summary.key),
  ["soon", "later", "expired", "sent-archived"],
);
assert.deepEqual(tracker.unavailable, ["missing"]);
assert.equal(tracker.rows.at(-1).sent, true);
assert.equal(tracker.rows.at(-1).current, undefined);
const dateCase = {
  ...summary,
  sourceUrl: "https://example.com/convocatoria",
  href: "/convocatorias/prueba",
  endsAt: "2026-10-29",
};
const calendarCatalog = [
  { ...dateCase, key: "current", startsAt: "2026-10-27" },
  {
    ...dateCase,
    key: "upcoming",
    startsAt: "2026-10-29",
    availability: "upcoming",
  },
  { ...dateCase, key: "sample", sample: true },
  { ...dateCase, key: "expired", endsAt: "2026-10-27" },
  { ...dateCase, key: "uncertain", availability: "stale" },
  { ...dateCase, key: "submitted" },
];
const calendarRows = savedApplications(
  calendarCatalog.map((job) => job.key),
  calendarCatalog,
  new Map([["submitted", dateCase]]),
  now,
).rows;
assert.deepEqual(
  pendingCalendarJobs(calendarRows, now).map((job) => [job.key, job.startsAt]),
  [
    ["current", undefined],
    ["upcoming", "2026-10-29"],
  ],
);
assert.deepEqual(
  pendingCalendarJobs(calendarRows, new Date("2026-10-30T05:00:00Z")),
  [],
);
const previousTimeZone = process.env.TZ;
process.env.TZ = "Pacific/Auckland";
assert.equal(formatDate("2026-11-16"), "16 de noviembre de 2026");
if (previousTimeZone === undefined) delete process.env.TZ;
else process.env.TZ = previousTimeZone;
assert.equal(
  daysUntil("2026-10-28", now),
  0,
  "El cierre de hoy debe indicar cero días.",
);
assert.equal(
  daysUntil("2026-10-27", now),
  -1,
  "Un cierre de ayer debe estar finalizado.",
);
assert.equal(
  daysUntil("2026-10-29", now),
  1,
  "Un cierre de mañana debe indicar un día.",
);
assert.equal(
  daysUntil("2026-10-28", new Date("2026-10-29T04:59:59Z")),
  0,
  "El día de Lima continúa hasta las 04:59 UTC.",
);
assert.equal(
  daysUntil("2026-10-28", new Date("2026-10-29T05:00:00Z")),
  -1,
  "El estado cambia a medianoche de Lima.",
);
assert.equal(normalize("  ADMINISTRACIÓN  "), "administracion");
const accented = filterOpportunities(
  opportunities,
  { q: "administración" },
  now,
);
assert.ok(accented.length > 0);
assert.deepEqual(
  accented,
  filterOpportunities(opportunities, { q: "administracion" }, now),
  "Las búsquedas con y sin tilde deben coincidir.",
);
const combined = filterOpportunities(
  opportunities,
  {
    q: "SUNAT sistemas",
    departamento: "Lima",
    tipo: "Preprofesional",
    sector: "Publico",
    modalidad: "Hibrido",
    estado: "vigentes",
  },
  now,
);
assert.equal(
  combined.length,
  1,
  "Todos los filtros deben combinarse sin perder la búsqueda.",
);
assert.equal(combined[0].organization, "SUNAT");
assert.equal(
  filterOpportunities(opportunities, { q: "SUNAT", sector: "Privado" }, now)
    .length,
  0,
  "Los filtros incompatibles deben dar un estado vacío.",
);
const open = filterOpportunities(opportunities, { estado: "vigentes" }, now);
const closed = filterOpportunities(
  opportunities,
  { estado: "finalizadas" },
  now,
);
assert.equal(open.length + closed.length, opportunities.length);
assert.ok(open.every((o) => daysUntil(o.endsAt, now) >= 0));
const byVacancies = filterOpportunities(
  opportunities,
  { orden: "vacantes" },
  now,
);
assert.ok(
  byVacancies.every(
    (o, i) => !i || byVacancies[i - 1].vacancies >= o.vacancies,
  ),
);
const byDate = filterOpportunities(opportunities, { orden: "cierre" }, now);
assert.ok(byDate.every((o, i) => !i || byDate[i - 1].endsAt <= o.endsAt));
for (const o of opportunities) {
  assert.equal(new URL(o.sourceUrl).protocol, "https:");
  assert.ok(Number.isFinite(daysUntil(o.endsAt, now)));
}
console.log(
  "OK: fechas en Lima, tildes, filtros combinados, estados vacíos, orden y enlaces.",
);

const { contentRecord } = load("../src/lib/portal-validation.ts");
const { publisherId, adsEnabled, indexable } = load(
  "../src/lib/portal-config.ts",
);
const original = JSON.parse(
  fs.readFileSync(
    new URL("../content/initial-articles.json", import.meta.url),
    "utf8",
  ),
)[0];
const articleDraft = contentRecord({
  kind: "article",
  payload: original.payload,
  status: "draft",
  verified: false,
});
assert.equal(articleDraft.status, "draft");
assert.throws(
  () =>
    contentRecord({
      kind: "article",
      payload: original.payload,
      status: "published",
      verified: false,
    }),
  /verificación/,
);
assert.throws(
  () =>
    contentRecord({
      kind: "opportunity",
      payload: { ...opportunities[0], endsAt: "2099-02-30" },
      status: "draft",
    }),
  /fecha/,
);
assert.throws(
  () =>
    contentRecord({
      kind: "opportunity",
      payload: {
        ...opportunities[0],
        endsAt: "2099-12-30",
        sourceUrl: "javascript:alert(1)",
      },
      status: "draft",
    }),
  /HTTPS/,
);
const safeJob = contentRecord({
  kind: "opportunity",
  payload: { ...opportunities[0], endsAt: "2099-12-30" },
  status: "published",
  verified: true,
});
assert.equal(safeJob.sample, false);
assert.equal(safeJob.revision, 1);
const changed = contentRecord(
  {
    kind: "opportunity",
    payload: {
      ...safeJob.payload,
      title: "Título nuevo para comprobar la dirección estable",
    },
    status: "draft",
    verified: true,
  },
  safeJob,
);
assert.equal(changed.slug, safeJob.slug);
assert.equal(changed.revision, 2);
const envNames = [
  "NEXT_PUBLIC_ADSENSE_CLIENT",
  "NEXT_PUBLIC_ADSENSE_ENABLED",
  "NEXT_PUBLIC_ADSENSE_APPROVED",
  "NEXT_PUBLIC_ADSENSE_CONSENT_READY",
  "SITE_INDEXABLE",
  "PORTAL_DEMO_MODE",
];
const previous = Object.fromEntries(
  envNames.map((key) => [key, process.env[key]]),
);
try {
  Object.assign(process.env, {
    NEXT_PUBLIC_ADSENSE_CLIENT: "ca-pub-1234567890123456",
    NEXT_PUBLIC_ADSENSE_ENABLED: "true",
    NEXT_PUBLIC_ADSENSE_APPROVED: "false",
    NEXT_PUBLIC_ADSENSE_CONSENT_READY: "true",
    SITE_INDEXABLE: "true",
    PORTAL_DEMO_MODE: "false",
  });
  assert.ok(publisherId());
  assert.equal(adsEnabled(), false);
  process.env.NEXT_PUBLIC_ADSENSE_APPROVED = "true";
  assert.equal(adsEnabled(), true);
  process.env.NEXT_PUBLIC_ADSENSE_CONSENT_READY = "false";
  assert.equal(adsEnabled(), false);
  process.env.PORTAL_DEMO_MODE = "true";
  assert.equal(indexable(), false);
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT = "placeholder";
  assert.equal(publisherId(), "");
} finally {
  for (const key of envNames)
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
}
console.log(
  "OK: validación editorial, fechas inválidas, fuentes seguras, revisión y activación de anuncios.",
);
