import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { createRequire, Module } from "node:module";
const load = createRequire(import.meta.url),
  original = Module._load;
load.extensions[".ts"] = (m, p) =>
  m._compile(
    ts.transpileModule(fs.readFileSync(p, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
    p,
  );
process.env.GEMINI_CV_ENABLED = "true";
process.env.GEMINI_API_KEY = "test-key-not-a-secret";
process.env.GEMINI_DAILY_LIMIT = "20";
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.VERCEL;
let modelCalls = [],
  rateCalls = [],
  blocked = "",
  mode = "ok",
  transientFailures = 0,
  remainingGlobals = Infinity;
const good = {
  overview: "Revisa los requisitos publicados.",
  keywords: ["Derecho"],
  priorities: ["Acredita tu formación real."],
  checklist: ["Consulta las bases."],
  questions: ["¿Qué funciones puedes acreditar?"],
};
const publicJob = {
  key: "puesto-real",
  title: "Asesor Legal",
  organization: "Entidad pública",
  type: "CAS",
  requirements: ["Título en Derecho"],
  summary: "Emitir informes.",
  href: "/convocatorias/puesto-real",
  privateExtra: "DO_NOT_SEND",
};
Module._load = function (name, ...args) {
  if (name === "server-only") return {};
  if (name === "@google/genai")
    return {
      GoogleGenAI: class {
        constructor(options) {
          assert.equal(options.httpOptions.retryOptions.attempts, 1);
          assert.ok(options.httpOptions.timeout <= 12000);
        }
        models = {
          generateContent: async (input) => {
            modelCalls.push(input);
            if (
              mode === "unavailable" ||
              (mode === "transient" && transientFailures++ === 0)
            )
              throw Object.assign(new Error("Unavailable"), { status: 504 });
            if (mode === "fail")
              throw new Error("PROVIDER_SECRET_MUST_NOT_LEAK");
            if (mode === "invalid") return { text: '{"overview":"<script>"}' };
            return { text: JSON.stringify(good) };
          },
        };
      },
    };
  if (name === "@/lib/editor-auth")
    return {
      assertOrigin: load("../src/lib/editor-auth.ts").assertOrigin,
      rateLimit: async (req, category, max, seconds) => {
        rateCalls.push({
          category,
          max,
          seconds,
          forwarded: req.headers.get("x-forwarded-for"),
        });
        return (
          category !== blocked &&
          (category !== "cv-global" || --remainingGlobals >= 0)
        );
      },
    };
  if (name === "@/lib/cv-jobs")
    return {
      resolveCvJob: async (key) =>
        key === "puesto-real"
          ? publicJob
          : key === "sample"
            ? { ...publicJob, sample: true }
            : key === "no-requirements"
              ? { ...publicJob, requirements: [] }
              : null,
    };
  if (name.startsWith("@/lib/"))
    return load("../src/lib/" + name.slice(6) + ".ts");
  return original.call(this, name, ...args);
};
const { POST } = load("../src/app/api/cv/coach/route.ts");
async function request(
  body = { jobKey: "puesto-real", adult: true },
  headers = {},
  raw = false,
) {
  return POST(
    new Request("http://127.0.0.1:3061/api/cv/coach", {
      method: "POST",
      headers: {
        host: "127.0.0.1:3061",
        Origin: "http://127.0.0.1:3061",
        "Content-Type": "application/json",
        ...headers,
      },
      body: raw ? body : JSON.stringify(body),
    }),
  );
}
for (const [body, headers, status, raw] of [
  [{ jobKey: "puesto-real", adult: true, cv: "PRIVATE_CV_CANARY" }, {}, 400],
  [{ jobKey: "https://127.0.0.1/private", adult: true }, {}, 400],
  [{ jobKey: "puesto-real", adult: false }, {}, 400],
  [
    { jobKey: "puesto-real", adult: true },
    { Origin: "https://attacker.invalid" },
    400,
  ],
  [{ jobKey: "puesto-real", adult: true }, { Origin: "" }, 400],
  ["x".repeat(701), {}, 413, true],
  ["{bad", {}, 400, true],
  [
    { jobKey: "puesto-real", adult: true },
    { "Content-Type": "text/plain" },
    415,
  ],
  [{ jobKey: "missing", adult: true }, {}, 404],
  [{ jobKey: "sample", adult: true }, {}, 404],
  [{ jobKey: "no-requirements", adult: true }, {}, 422],
]) {
  const r = await request(body, headers, raw);
  assert.equal(r.status, status);
  assert.equal(r.headers.get("cache-control"), "no-store");
}
assert.equal(
  modelCalls.length,
  0,
  "Las solicitudes inválidas no deben invocar a Gemini.",
);
let r = await request();
assert.equal(r.status, 200);
assert.deepEqual((await r.json()).advice, good);
assert.equal(modelCalls.length, 1);
assert.deepEqual(JSON.parse(modelCalls[0].contents), {
  title: publicJob.title,
  organization: publicJob.organization,
  type: publicJob.type,
  requirements: publicJob.requirements,
  summary: publicJob.summary,
});
assert.equal(JSON.stringify(modelCalls).includes("DO_NOT_SEND"), false);
assert.equal(JSON.stringify(modelCalls).includes("PRIVATE_CV_CANARY"), false);
assert.equal(modelCalls[0].config.tools, undefined);
assert.ok(
  rateCalls.some(
    (x) =>
      x.category === "cv-global" &&
      x.max === 20 &&
      x.seconds === 86400 &&
      x.forwarded === null,
  ),
);
assert.ok(
  rateCalls.some(
    ({ category, max, seconds }) =>
      category === "cv-coach-daily" && max === 2 && seconds === 86400,
  ),
);
for (const category of ["cv-coach-daily", "cv-global"]) {
  blocked = category;
  const before = modelCalls.length;
  r = await request();
  assert.equal(r.status, 429);
  assert.equal(modelCalls.length, before);
}
blocked = "";
mode = "transient";
transientFailures = 0;
let previousCalls = modelCalls.length,
  previousGlobalCalls = rateCalls.filter(
    (x) => x.category === "cv-global",
  ).length;
r = await request();
assert.equal(r.status, 200);
assert.equal(modelCalls.length - previousCalls, 2);
assert.equal(
  rateCalls.filter((x) => x.category === "cv-global").length -
    previousGlobalCalls,
  2,
);
assert.equal(modelCalls.at(-1).contents, modelCalls.at(-2).contents);
mode = "unavailable";
remainingGlobals = 1;
previousCalls = modelCalls.length;
r = await request();
assert.equal(r.status, 429);
assert.equal(
  modelCalls.length - previousCalls,
  1,
  "No reintentar cuando se agota el límite global.",
);
remainingGlobals = Infinity;
previousCalls = modelCalls.length;
r = await request();
assert.equal(r.status, 503);
assert.equal(
  modelCalls.length - previousCalls,
  2,
  "Como máximo dos intentos por consulta.",
);
mode = "fail";
r = await request();
assert.equal(r.status, 503);
assert.equal((await r.text()).includes("PROVIDER_SECRET"), false);
mode = "invalid";
r = await request();
assert.equal(r.status, 503);
process.env.GEMINI_CV_ENABLED = "false";
r = await request();
assert.equal(r.status, 503);
const { enrichOfficialCandidate } = load("../src/lib/import-enrichment.ts");
const savedFetch = globalThis.fetch;
let fetchCalls = 0;
globalThis.fetch = async (url, options) => {
  fetchCalls++;
  assert.equal(options.redirect, "error");
  return new Response("<html>Sin archivos</html>", {
    headers: { "Content-Type": "text/html" },
  });
};
const c = {
  sourceUrl:
    "https://www.investinperu.pe/convocatorias-laborales/asesor-legal/",
  fingerprint: "listing",
};
for (const sourceUrl of [
  "http://127.0.0.1/",
  c.sourceUrl + "?url=http://127.0.0.1",
  "https://evil.example/convocatorias-laborales/asesor-legal/",
]) {
  await assert.rejects(() =>
    enrichOfficialCandidate({ ...c, sourceUrl }, "User-agent: *\nAllow: /"),
  );
}
assert.equal(fetchCalls, 0);
await assert.rejects(() =>
  enrichOfficialCandidate(c, "User-agent: *\nDisallow: /"),
);
assert.equal(fetchCalls, 0);
const enriched = await enrichOfficialCandidate(c, "User-agent: *\nAllow: /");
assert.equal(enriched.details.documents.length, 0);
assert.equal(fetchCalls, 1);
globalThis.fetch = savedFetch;
Module._load = original;
console.log(
  "OK: API IA rechaza CV, CSRF, URLs y cuerpos excesivos; cuota global, fallos sin secretos y scraper con destinos cerrados.",
);
