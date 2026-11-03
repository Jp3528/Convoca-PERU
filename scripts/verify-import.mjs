import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { createRequire, Module } from "node:module";

// No external calls or main-catalog writes are allowed in this test process.
process.env.LOCAL_DATA_DIR = ".data-tests";
process.env.IMPORT_ENRICH_DETAILS = "false";
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.VERCEL;
const load = createRequire(import.meta.url);
const originalLoad = Module._load;
Module._load = function (name, ...args) {
  return name === "server-only" ? {} : originalLoad.call(this, name, ...args);
};
load.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText,
    filename,
  );
const { parseMtcCas, parseProinversion, robotsAllows } = load(
  "../src/lib/import-parser.ts",
);
const { scanSource, ingestCandidates } = load("../src/lib/import-service.ts");
const { getRecords, getCatalog, saveRecord, getImportJob, finishImportJob } =
  load("../src/lib/portal-store.ts");
const tag = String(Date.now());
function fixture(
  title = "ANALISTA DE PRUEBAS SIN OFERTA REAL",
  end = "30/12/2099",
) {
  return `<span id="lblCntPas">2 convocatorias.</span><table>${[0, 1].map((i) => `<tr id="rptConvocatoria_trFila_${i}"><td><span id="rptConvocatoria_lblConvocatoria_${i}">Nº ${tag}${i}-2099-MTC/11</span></td><td><span id="rptConvocatoria_lblDescripcion_${i}">${title} &amp; VALIDACIÓN ${i}</span></td><td><span id="rptConvocatoria_lblPeriodo_${i}">Del 01/12/2099 al ${end}</span></td><td><a href="javascript:alert('no ejecutar')">Descargar</a></td></tr>`).join("")}</table>`;
}
const checkedAt = "2026-10-29T17:00:00Z";
const parsed = parseMtcCas(fixture(), checkedAt);
assert.equal(parsed.length, 2);
assert.match(parsed[0].title, /& VALIDACIÓN/);
assert.equal(parsed[0].endsAt, "2099-12-30");
assert.equal(parsed[0].firstSeenAt, checkedAt);
assert.equal(
  parsed[0].fingerprint,
  parseMtcCas(fixture(), "2026-10-30T17:00:00Z")[0].fingerprint,
);
assert.throws(
  () => parseMtcCas(fixture().replace("2 convocatorias.", "3 convocatorias.")),
  /formato/,
);
assert.throws(() => parseMtcCas("<h1>Captcha</h1>"), /formato/);
assert.throws(
  () => parseMtcCas(fixture(undefined, "31/02/2099")),
  /fecha inválida/,
);
assert.throws(
  () => parseMtcCas(fixture().replace("Del 01/12/2099", "Del 31/12/2099")),
  /periodo/,
);
assert.equal(
  parseMtcCas('<span id="lblCntPas">0 convocatorias.</span>').length,
  0,
);
assert.equal(robotsAllows("User-agent: *\nDisallow: /", "/jobs"), false);
assert.equal(
  robotsAllows(
    "User-agent: GPTBot\nDisallow: /\nUser-agent: *\nAllow: /",
    "/jobs",
  ),
  true,
);
assert.equal(
  robotsAllows(
    "User-agent: *\nDisallow: /jobs\nAllow: /jobs/public",
    "/jobs/public/1",
  ),
  true,
);
assert.equal(robotsAllows("User-agent: *\nDisallow: /*.pdf$", "/1.pdf"), false);
assert.equal(
  robotsAllows("User-agent: *\nDisallow: /*.pdf$", "/1.pdf/more"),
  true,
);
assert.equal(
  robotsAllows(
    "User-agent: ConvocaPeruImporter\nDisallow: /\nUser-agent: *\nAllow: /",
    "/jobs",
  ),
  false,
);

const originalFetch = globalThis.fetch;
let html = fixture(),
  robots = "User-agent: *\nAllow: /",
  calls = [];
globalThis.fetch = async (url, options) => {
  calls.push(String(url));
  assert.equal(options.redirect, "error");
  assert.match(options.headers["User-Agent"], /^ConvocaPeruImporter/);
  assert.equal(new URL(url).hostname, "portal.mtc.gob.pe");
  return new Response(String(url).endsWith("robots.txt") ? robots : html, {
    headers: {
      "Content-Type": String(url).endsWith("robots.txt")
        ? "text/plain"
        : "text/html; charset=utf-8",
    },
  });
};
const first = await scanSource("mtc-cas");
assert.equal(first.created, 2);
assert.equal(first.updated, 0);
const second = await scanSource("mtc-cas");
assert.equal(second.created, 0);
assert.equal(second.unchanged, 2);
let saved = (await getRecords()).filter(
  (r) => r.kind === "import" && r.payload.reference.startsWith(tag),
);
assert.equal(saved.length, 2);
assert.ok(saved.every((r) => r.status === "draft" && !r.verified && !r.sample));
await assert.rejects(
  () => saveRecord(saved[0]),
  /ya existe/,
  "Una inserción concurrente no debe reemplazar una revisión existente.",
);
const concurrentCandidates = parsed.map((c) => ({
  ...c,
  reference: c.reference.replace(tag, tag + "9"),
}));
const concurrentReports = await Promise.all([
  ingestCandidates(concurrentCandidates, "mtc-cas", checkedAt),
  ingestCandidates(concurrentCandidates, "mtc-cas", checkedAt),
]);
assert.equal(
  concurrentReports.reduce((sum, r) => sum + r.created, 0),
  2,
);
assert.equal(
  (await getRecords()).filter(
    (r) => r.kind === "import" && r.payload.reference.startsWith(tag + "9"),
  ).length,
  2,
);
assert.ok(
  !(await getCatalog()).opportunities.some((o) =>
    o.title.includes("ANALISTA DE PRUEBAS"),
  ),
);
const stableId = saved[0].id,
  stableCreated = saved[0].created_at;
const currentForArchive = (await getRecords()).find((r) => r.id === stableId);
await saveRecord(
  {
    ...currentForArchive,
    status: "archived",
    revision: currentForArchive.revision + 1,
  },
  currentForArchive.revision,
);
html = fixture("ANALISTA DE PRUEBAS CON CAMBIO OFICIAL");
const third = await scanSource("mtc-cas");
assert.equal(third.updated, 2);
const archived = (await getRecords()).find((r) => r.id === stableId);
assert.equal(archived.status, "archived");
assert.equal(archived.created_at, stableCreated);
assert.notEqual(archived.payload.fingerprint, saved[0].payload.fingerprint);
const countBefore = (await getRecords()).length;
html = "<html>Nuevo formato</html>";
await assert.rejects(() => scanSource("mtc-cas"), /formato/);
assert.equal((await getRecords()).length, countBefore);
calls = [];
await assert.rejects(
  () => scanSource("https://127.0.0.1/private"),
  /fuente disponible/,
);
assert.equal(calls.length, 0);
robots = "User-agent: *\nDisallow: /";
await assert.rejects(() => scanSource("mtc-cas"), /no permite/);
assert.equal(calls.length, 1, "Una regla robots impide descargar el listado.");
globalThis.fetch = originalFetch;
function proFixture(
  period = "Del 01 de diciembre al 30 de diciembre de 2099",
  reference = "CAS 999-2099",
  id = tag + "7",
) {
  return `<div class="jet-listing-grid__item" data-post-id="${id}"><span class="jet-listing-dynamic-field__content">${reference}</span><span class="jet-listing-dynamic-field__content">ANALISTA DE VALIDACIÓN AUTOMÁTICA</span><span class="jet-listing-dynamic-terms__link">Vigente</span><div class="elementor-icon-box-content"><p class="elementor-icon-box-title">Fecha de Postulación</p><p class="elementor-icon-box-description">${period}</p></div><div class="elementor-icon-box-content"><p class="elementor-icon-box-title">Lugar</p><p class="elementor-icon-box-description">Lima</p></div><a href="https://www.investinperu.pe/convocatorias-laborales/prueba-${tag}/">Fuente</a></div>`;
}
assert.equal(parseProinversion(proFixture())[0].endsAt, "2099-12-30");
assert.equal(
  parseProinversion(proFixture("Del 01 al 30 de diciembre de 2099"))[0]
    .startsAt,
  "2099-12-01",
);
assert.equal(
  parseProinversion(proFixture("Del 01/12/2099 al 30/12/2099"))[0].type,
  "CAS",
);
assert.equal(
  parseProinversion(proFixture(undefined, "CAP 001-2099"))[0].type,
  "Empleo",
);
assert.equal(
  parseProinversion(proFixture("Fecha sin año", "CAP 001-2099-INTERNO")).length,
  0,
);
assert.throws(
  () =>
    parseProinversion(
      proFixture("Del 31 de febrero al 30 de diciembre de 2099"),
    ),
  /fecha inválida/,
);
assert.throws(
  () =>
    parseProinversion(
      proFixture().replace(
        "https://www.investinperu.pe/convocatorias-laborales/",
        "https://otro.example/",
      ),
    ),
  /fuente oficial/,
);

const {
  runAutomaticImport,
  automationStatus,
  validCronRequest,
  nextAutomaticRun,
} = load("../src/lib/import-automation.ts");
const {
  publicDiscoveries,
  filterDiscoveries,
  filterDiscoveryOpportunities,
  excludeReviewedDiscoveries,
  discoveryKey,
} = load("../src/lib/discoveries.ts");
process.env.AUTO_IMPORT_ENABLED = "true";
process.env.AUTO_IMPORT_INTERVAL_MINUTES = "60";
process.env.LOCAL_IMPORT_WORKER = "true";
process.env.CRON_SECRET = "solo-prueba-local-".repeat(4);
assert.equal(validCronRequest(new Request("http://127.0.0.1")), false);
assert.equal(
  validCronRequest(
    new Request("http://127.0.0.1", {
      headers: { Authorization: "Bearer " + process.env.CRON_SECRET },
    }),
  ),
  true,
);
assert.equal(
  nextAutomaticRun(new Date("2026-10-29T18:00:00Z")),
  "2026-10-29T19:00:00.000Z",
);
process.env.VERCEL = "1";
assert.equal(
  nextAutomaticRun(new Date("2026-10-29T12:40:00Z")),
  "2026-10-30T12:00:00.000Z",
);
delete process.env.VERCEL;
async function dueAgain() {
  const previous = await getImportJob();
  if (previous)
    await finishImportJob({
      ...previous,
      leaseUntil: new Date(0).toISOString(),
      nextRunAt: new Date(0).toISOString(),
    });
}
await dueAgain();
let failMtc = false,
  automaticCalls = 0;
globalThis.fetch = async (url) => {
  automaticCalls++;
  const target = new URL(url),
    pro = target.hostname === "www.investinperu.pe";
  assert.ok(pro || target.hostname === "portal.mtc.gob.pe");
  const robot = target.pathname === "/robots.txt";
  if (robot)
    return new Response(pro ? "" : "User-agent: *\nAllow: /", {
      status: pro ? 403 : 200,
    });
  return new Response(
    pro ? proFixture() : fixture("ANALISTA DE PRUEBAS CON CAMBIO OFICIAL"),
    {
      status: !pro && failMtc ? 503 : 200,
      headers: { "Content-Type": "text/html" },
    },
  );
};
const simultaneous = await Promise.all([
  runAutomaticImport(),
  runAutomaticImport(),
]);
const completed = simultaneous.find((r) => r.status);
assert.equal(completed.status, "success");
assert.equal(completed.reports.length, 2);
assert.equal(
  simultaneous.filter((r) => r.skipped).length,
  1,
  "Dos llamadas al cron solo ejecutan una búsqueda.",
);
assert.equal(automaticCalls, 4);
assert.equal((await runAutomaticImport()).skipped, "not_due");
assert.equal(
  automaticCalls,
  4,
  "No se consulta la fuente antes de la próxima ejecución.",
);
const status = await automationStatus(),
  privateJob = await getImportJob();
assert.equal(status.scheduler, "local");
assert.equal(JSON.stringify(status).includes(privateJob.leaseToken), false);
const discoveries = publicDiscoveries(await getRecords());
assert.ok(discoveries.some((c) => c.sourceId === "proinversion"));
const liveCandidate = discoveries.find((c) => c.sourceId === "proinversion");
assert.match(discoveryKey(liveCandidate), /^hallazgo-[a-z0-9-]+$/);
assert.equal(
  publicDiscoveries(await getRecords()).find((c) => c.id === liveCandidate.id)
    ?.id,
  liveCandidate.id,
  "La clave de guardado se conserva después de volver a leer la fuente.",
);
assert.ok(
  filterDiscoveryOpportunities(discoveries, {
    q: "validacion",
    departamento: "Lima",
    tipo: "CAS",
    sector: "Publico",
  }).length,
);
assert.equal(
  filterDiscoveryOpportunities([{ ...liveCandidate, type: "Empleo" }], {
    tipo: "Empleo",
  }).length,
  1,
);
assert.equal(
  filterDiscoveryOpportunities(discoveries, { departamento: "Cusco" }).length,
  0,
);
assert.equal(
  filterDiscoveryOpportunities(discoveries, { modalidad: "Remoto" }).length,
  0,
);
assert.equal(
  filterDiscoveryOpportunities(discoveries, { sector: "Privado" }).length,
  0,
);
assert.equal(
  filterDiscoveryOpportunities(discoveries, { estado: "finalizadas" }).length,
  0,
);
assert.equal(
  filterDiscoveryOpportunities(discoveries, { tipo: "Preprofesional" }).length,
  0,
);
assert.equal(
  filterDiscoveryOpportunities([{ ...liveCandidate, location: undefined }], {
    departamento: "Lima",
  }).length,
  0,
);
assert.equal(
  filterDiscoveryOpportunities(
    [{ ...liveCandidate, location: "Lima - San Isidro" }],
    { departamento: "Lima" },
  ).length,
  1,
);
assert.equal(
  filterDiscoveryOpportunities([{ ...liveCandidate, location: "Lima" }], {
    departamento: "Ica",
  }).length,
  0,
);
assert.equal(
  excludeReviewedDiscoveries(discoveries, [
    {
      title: liveCandidate.title,
      endsAt: liveCandidate.endsAt,
      importProvenance: { candidateId: liveCandidate.id },
    },
  ]).some((c) => c.id === liveCandidate.id),
  false,
  "Una ficha revisada y su hallazgo no duplican el resultado del buscador.",
);
assert.equal(
  excludeReviewedDiscoveries(
    [liveCandidate],
    [
      {
        title: liveCandidate.title,
        endsAt: "2000-01-01",
        importProvenance: { candidateId: liveCandidate.id },
      },
    ],
  ).length,
  1,
  "Una fecha nueva en la fuente conserva el hallazgo aunque haya una ficha antigua.",
);
assert.ok(
  filterDiscoveries(discoveries, "validacion Lima", "proinversion").length,
);
assert.ok(
  discoveries.every((c) => !("fingerprint" in c) && !("firstSeenAt" in c)),
);
const candidateRecord = (await getRecords()).find(
  (r) => r.kind === "import" && r.payload.externalId === tag + "7",
);
assert.equal(
  publicDiscoveries([{ ...candidateRecord, status: "archived" }]).length,
  0,
);
assert.equal(
  publicDiscoveries([
    {
      ...candidateRecord,
      payload: {
        ...candidateRecord.payload,
        lastCheckedAt: "2000-01-01T00:00:00Z",
      },
    },
  ]).length,
  0,
);
assert.equal(
  publicDiscoveries([
    {
      ...candidateRecord,
      payload: {
        ...candidateRecord.payload,
        noLongerListedAt: new Date().toISOString(),
      },
    },
  ]).length,
  0,
);
await dueAgain();
failMtc = true;
const partial = await runAutomaticImport();
assert.equal(partial.status, "partial");
assert.equal(partial.reports.length, 1);
assert.equal(partial.errors[0].sourceId, "mtc-cas");
await ingestCandidates([], "proinversion", new Date().toISOString());
assert.equal(
  publicDiscoveries(await getRecords()).filter(
    (c) => c.sourceId === "proinversion",
  ).length,
  0,
  "Una plaza retirada desaparece de la sección automática.",
);
globalThis.fetch = originalFetch;
// One active candidate is intentionally retained ONLY in .data-tests for HTTP linkage tests.
console.log(
  "Importador verificado: dos fuentes, fechas, robots, deduplicación, ejecución automática exclusiva, próxima búsqueda, fallos por fuente y hallazgos públicos sin datos privados.",
);
