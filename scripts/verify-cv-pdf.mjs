import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { extractText } from "unpdf";
import { PDFDocument } from "pdf-lib";
const load = createRequire(import.meta.url);
load.extensions[".ts"] = (module, file) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    file,
  );
const { createCvPdf } = load("../src/lib/cv-pdf.ts");
const fonts = {
  regular: fs.readFileSync(
    new URL("../public/fonts/inter-latin-400.ttf", import.meta.url),
  ),
  bold: fs.readFileSync(
    new URL("../public/fonts/inter-latin-700.ttf", import.meta.url),
  ),
};
const job = {
  title: "Analista de proyectos",
  organization: "Entidad de ejemplo",
};
const draft = [
  "Álex Núñez",
  "alex@example.invalid | +51 900 111 222",
  "Perfil profesional",
  "Egresado en Administración con experiencia en seguimiento de proyectos y preparación de reportes.",
  "Experiencia laboral",
  ...Array.from(
    { length: 20 },
    (_, index) =>
      `Proyecto de ejemplo ${index + 1} - Empresa de prueba - 2021 a 2024\nCoordiné la revisión de documentos e informes. Registré plazos, organicé expedientes y preparé reportes de seguimiento con Excel. Conservé las evidencias para su revisión por el equipo.`,
  ),
  "Formación académica",
  "Bachiller en Administración - Universidad de ejemplo - 2020",
  "Habilidades",
  "Excel, gestión documental y análisis de información.",
].join("\n\n");
const bytes = await createCvPdf(draft, job, fonts);
const pdf = await PDFDocument.load(bytes);
assert.ok(pdf.getPageCount() >= 2);
const { text } = await extractText(new Uint8Array(bytes), { mergePages: true });
const normalize = (value) => value.replace(/\s+/g, " ").trim();
assert.ok(normalize(text).includes("Álex Núñez"));
assert.ok(
  normalize(text).includes(
    "Bachiller en Administración - Universidad de ejemplo - 2020",
  ),
);
for (let i = 1; i <= 20; i++)
  assert.ok(
    normalize(text).includes(
      `Proyecto de ejemplo ${i} - Empresa de prueba - 2021 a 2024`,
    ),
  );
assert.equal(
  pdf.catalog
    .keys()
    .some((key) => /JavaScript|OpenAction|AA|AcroForm/.test(key.asString())),
  false,
);
await assert.rejects(
  () => createCvPdf("Símbolo no representable: 🐈", job, fonts),
  /símbolos/,
);
await assert.rejects(
  () => createCvPdf("x".repeat(24001), job, fonts),
  /24 000/,
);
fs.mkdirSync(new URL("../.data/", import.meta.url), { recursive: true });
fs.writeFileSync(
  new URL("../.data/cv-ejemplo-pdf.pdf", import.meta.url),
  bytes,
);
console.log(
  `OK: PDF local, ${pdf.getPageCount()} páginas, tildes, fechas, texto seleccionable y límites sin acciones ejecutables.`,
);
