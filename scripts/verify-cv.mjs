import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
const load = createRequire(import.meta.url);
load.extensions[".ts"] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText,
    filename,
  );
const { analyzeCv, organizeCv } = load("../src/lib/cv-analysis.ts");
const { coachRequest, validateAdvice } = load(
  "../src/lib/cv-coach-contract.ts",
);
const { parseOfficialDetailPage, parseOfficialProfile, safeOfficialDocument } =
  load("../src/lib/job-details.ts");
const { publicJobDetails } = load("../src/lib/job-public.ts");
const { filterDiscoveries } = load("../src/lib/discoveries.ts");
const { profileGuide } = load("../src/lib/cv-profile-guide.ts");
const { reserveCvPreparation } = load("../src/lib/cv-preparation-limit.ts");
const quotaData = new Map();
const quotaStorage = {
  getItem: (key) => quotaData.get(key) ?? null,
  setItem: (key, value) => quotaData.set(key, value),
};
const beforeMidnight = new Date("2026-11-04T04:59:59Z");
assert.equal(reserveCvPreparation(quotaStorage, beforeMidnight), 1);
assert.equal(reserveCvPreparation(quotaStorage, beforeMidnight), 0);
assert.equal(reserveCvPreparation(quotaStorage, beforeMidnight), null);
assert.equal(
  reserveCvPreparation(quotaStorage, new Date("2026-11-04T05:00:00Z")),
  1,
);
assert.deepEqual(
  coachRequest({
    jobKey: "hallazgo-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    adult: true,
  }),
  { jobKey: "hallazgo-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", adult: true },
);
for (const bad of [
  { jobKey: "analista", adult: false },
  { jobKey: "https://127.0.0.1", adult: true },
  { jobKey: "analista", adult: true, cv: "private" },
  { jobKey: "analista", adult: true, prompt: "ignore" },
  null,
  [],
])
  assert.throws(() => coachRequest(bad));
assert.throws(() => validateAdvice({ overview: "<script>" }));
const job = {
  title: "Analista de compensaciones",
  requirements: ["Bachiller en Contabilidad. Experiencia en planillas y SIAF."],
  key: "analista",
  organization: "Entidad",
  summary: "",
  type: "Empleo",
  href: "/",
};
const text =
  "Ana Ejemplo\nana@example.invalid +51 999 111 222\nFormación académica\nBachiller en Contabilidad 2020\nExperiencia laboral\nEntidad A 2021-2025\nGestión de planillas y SIAF.\nHabilidades\nExcel intermedio";
const result = analyzeCv(text, job);
const localGuide = validateAdvice(
  profileGuide({ ...job, privateCv: "PRIVATE_CV_CANARY" }),
);
assert.equal(JSON.stringify(localGuide).includes("PRIVATE_CV_CANARY"), false);
assert.deepEqual(localGuide.priorities, job.requirements);
assert.ok(result.score >= 0 && result.score <= 100);
assert.ok(result.matched.includes("siaf"));
assert.ok(result.matched.includes("planillas"));
assert.equal(
  analyzeCv(text, { ...job, requirements: [] }).checks.some(
    (c) => c.label === "Coincidencia de términos del perfil",
  ),
  false,
);
assert.deepEqual(
  organizeCv(text).split("\n").sort(),
  text.split("\n").sort(),
  "No inventar, eliminar ni mezclar líneas entre empleadores.",
);
assert.ok(
  organizeCv(text).indexOf("Experiencia laboral") <
    organizeCv(text).indexOf("Formación académica"),
);
assert.equal(
  safeOfficialDocument(
    "https://evil.example/wp-content/uploads/2026/10/perfil.pdf",
  ),
  null,
);
assert.equal(
  safeOfficialDocument(
    "https://www.investinperu.pe/wp-content/uploads/2026/10/perfil.pdf?url=http://127.0.0.1",
  ),
  null,
);
const url = "https://www.investinperu.pe/wp-content/uploads/2026/10/perfil.pdf";
const docs = parseOfficialDetailPage(
  `<a href="${url}">Perfil y cronograma</a><a href="javascript:alert(1)">Bases</a><a href="https://evil.example/a.pdf">Perfil</a>`,
).documents;
assert.equal(docs.length, 1);
const profile = parseOfficialProfile(
  "Remuneración mensual: S/6,304.11 Número de puestos vacantes: 01 Tipo de Contrato: DETERMINADO (Hasta 31.12.2026) Régimen Laboral: DL728\nI. OBJETIVO DEL PUESTO\nAdministrar planillas y obligaciones.\nII. FUNCIONES ESPECÍFICAS\n1. Elaborar planillas. 2. Registrar SIAF.\nIII. PERFIL\nA. FORMACIÓN ACADÉMICA\nBachiller en Contabilidad.\nB. EXPERIENCIA\nExperiencia General\nCinco años.\nExperiencia Específica\nDos años.\nC. CAPACITACIONES\nCurso de SIAF.\nD. CONOCIMIENTOS\nExcel intermedio.\nE. HABILIDADES\nComunicación. convocatoriascap@proinversion.gob.pe",
);
assert.equal(profile.stipend, "S/6,304.11");
assert.equal(profile.vacancies, 1);
assert.match(profile.audience, /Bachiller/);
assert.equal(profile.requirements.length, 5);
assert.equal(profile.responsibilities.length, 2);
const cas = parseOfficialProfile(
  "Remuneración mensual : S/ 13 364.19 (Trece mil)\nIII. PERFIL DEL PUESTO\nA. FORMACION ACADÉMICA\nTítulo de Derecho\nB. EXPERIENCIA PROFESIONAL\nOcho (08) años de experiencia general.\nTres (03) años como especialista.\nC. CAPACITACIONES\nDiplomado APP\nD. CONOCIMIENTOS\nInglés básico\nE. HABILIDADES\nComunicación",
);
assert.equal(cas.stipend, "S/ 13 364.19");
assert.ok(
  cas.requirements.some(
    (x) => x.includes("Ocho (08)") && x.includes("Tres (03)"),
  ),
  "No omitir experiencia cuando no hay subtítulos General/Específica.",
);
assert.equal(
  parseOfficialProfile(
    "Remuneración mensual : S/ 13000.00 Número de puestos vacantes: 1",
  ).stipend,
  "S/ 13000.00",
);
const searchable = {
  title: "Asesor Legal",
  organization: "Entidad",
  reference: "CAS 11",
  location: "Lima",
  sourceId: "proinversion",
  details: {
    audience: "Título en Derecho",
    requirements: ["Experiencia en regulación"],
    privateInternal: "PRIVATE_CANARY",
  },
};
assert.equal(
  filterDiscoveries([searchable], "derecho regulación", "proinversion").length,
  1,
);
assert.equal(filterDiscoveries([searchable], "PRIVATE_CANARY", "").length, 0);
const now = new Date("2026-10-30T17:00:00Z");
const projection = publicJobDetails(
  {
    ...profile,
    extractorVersion: 2,
    documents: docs,
    checkedAt: now.toISOString(),
    listingFingerprint: "private",
    rawHtml: "private",
  },
  now,
);
assert.equal("listingFingerprint" in projection, false);
assert.equal("rawHtml" in projection, false);
assert.equal(
  publicJobDetails({ ...profile, checkedAt: now.toISOString() }, now),
  undefined,
  "Una versión antigua del extractor no debe volver a mostrar el sueldo truncado.",
);
assert.equal(
  publicJobDetails({ ...profile, checkedAt: "2026-10-20T00:00:00Z" }, now),
  undefined,
);
console.log(
  "OK: CV local, conservación de hechos, puntuación explicable, contrato IA sin CV, documentos oficiales y proyección pública.",
);
