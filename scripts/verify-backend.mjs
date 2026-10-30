import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3061";
if (new URL(base).hostname !== "127.0.0.1" || new URL(base).port !== "3061")
  throw new Error(
    "Usa el servidor de pruebas local en 3061 con LOCAL_DATA_DIR=.data-tests.",
  );
const credentials = await fs.readFile(
  new URL("../.local-admin.txt", import.meta.url),
  "utf8",
);
const email = credentials.match(/^Correo: (.+)$/m)[1].trim(),
  password = credentials.match(/^Contraseña: (.+)$/m)[1].trim();
let cookie = "";
async function request(
  path,
  body,
  method = body ? "POST" : "GET",
  origin = base,
) {
  const response = await fetch(base + path, {
    method,
    headers: {
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await response.json();
  } catch {}
  return { response, data };
}
assert.equal((await request("/api/editor/content")).response.status, 401);
assert.equal((await request("/api/editor/import")).response.status, 401);
assert.equal((await fetch(base + "/api/cron/import")).status, 401);
assert.equal((await fetch(base + "/api/cron/import", { headers: { Authorization: "Bearer incorrecto" } })).status, 401);
assert.equal((await request("/api/editor/content", {})).response.status, 401);
assert.equal(
  (await request("/api/editor/import", { action: "scan", sourceId: "mtc-cas" }))
    .response.status,
  401,
);
assert.equal(
  (
    await request("/api/editor/session", {
      email,
      password: "contraseña-incorrecta",
    })
  ).response.status,
  401,
);
const login = await request("/api/editor/session", { email, password });
assert.equal(login.response.status, 200);
const setCookie = login.response.headers.get("set-cookie");
assert.match(setCookie, /HttpOnly/i);
assert.match(setCookie, /SameSite=strict/i);
cookie = setCookie.split(";")[0];
const isolation = await request("/api/editor/content");
const autoState = await request("/api/editor/import");
assert.equal(autoState.response.status, 200);
assert.equal("leaseToken" in (autoState.data.automation.state || {}), false);
const privateEnv = await fs.readFile(new URL("../.env.local", import.meta.url), "utf8");
const cronSecret = privateEnv.match(/^CRON_SECRET=(.+)$/m)?.[1].trim();
assert.ok(cronSecret?.length >= 32, "Ejecuta npm run setup:local.");
assert.equal((await fetch(base + "/api/cron/import?ready=1", { headers: { Authorization: "Bearer " + cronSecret } })).status, 200);
assert.equal(
  isolation.response.headers.get("x-portal-storage"),
  "local",
  "Las pruebas no deben escribir en Supabase.",
);
assert.equal(
  isolation.response.headers.get("x-portal-test-storage"),
  "true",
  "Levanta 3061 con LOCAL_DATA_DIR=.data-tests.",
);
assert.equal(
  (await request("/api/editor/content", {}, "POST", "https://otro.example"))
    .response.status,
  400,
);
const tag = Date.now().toString(36);
const payload = {
  title: "Prueba funcional " + tag,
  organization: "Entidad de prueba local",
  sector: "Publico",
  type: "Preprofesional",
  department: "Lima",
  province: "Lima",
  modality: "Hibrido",
  vacancies: 2,
  careers: ["Administración"],
  endsAt: "2099-12-30",
  stipend: "Solo prueba, no es una oferta",
  summary:
    "Registro de pruebas automatizadas del portal. No es una convocatoria real ni está disponible para postular. Se archiva al finalizar la verificación.",
  requirements: ["Requisito ficticio para comprobar la ficha."],
  steps: ["No postular. Registro exclusivo de pruebas locales."],
  sourceName: "Portal de prueba",
  sourceUrl: "https://www.gob.pe/",
};
// npm test leaves a synthetic import candidate in the isolated test store.
assert.equal(
  (
    await request(
      "/api/editor/import",
      { action: "scan", sourceId: "mtc-cas" },
      "POST",
      "https://otro.example",
    )
  ).response.status,
  400,
);
assert.equal(
  (
    await request("/api/editor/import", {
      action: "scan",
      sourceId: "https://127.0.0.1/private",
    })
  ).response.status,
  400,
);
const candidate = isolation.data.find(
  (r) =>
    r.kind === "import" &&
    r.status === "draft" &&
    r.payload.title.startsWith("ANALISTA DE PRUEBAS CON CAMBIO OFICIAL"),
);
assert.ok(candidate, "Ejecuta npm test antes de las pruebas HTTP.");
const importBody = {
  kind: "opportunity",
  payload: { ...payload, title: "Ficha importada de prueba " + tag },
  status: "draft",
  verified: false,
  importId: candidate.id,
  importFingerprint: candidate.payload.fingerprint,
};
assert.equal(
  (
    await request("/api/editor/content", {
      ...importBody,
      importFingerprint: "hash-anterior",
    })
  ).response.status,
  409,
);
const linked = await request("/api/editor/content", importBody);
assert.equal(linked.response.status, 201);
assert.equal(linked.data.payload.importProvenance.candidateId, candidate.id);
assert.equal(
  (await request("/api/editor/content", importBody)).response.status,
  400,
  "Una referencia no crea dos fichas editoriales.",
);
assert.equal(
  (await fetch(base + "/convocatorias/" + linked.data.slug)).status,
  404,
);
const linkedEdit = await request("/api/editor/content", {
  ...linked.data,
  payload: { ...linked.data.payload, title: "Ficha importada editada " + tag },
});
assert.equal(linkedEdit.response.status, 200);
assert.equal(
  linkedEdit.data.payload.importProvenance.fingerprint,
  candidate.payload.fingerprint,
  "La procedencia se conserva al editar.",
);
assert.equal(
  (
    await request("/api/editor/content", {
      ...candidate,
      kind: "opportunity",
      payload,
    })
  ).response.status,
  400,
  "El importado no puede convertirse saltándose la revisión.",
);
assert.equal(
  (
    await request("/api/editor/import", {
      action: "archive",
      id: candidate.id,
      revision: candidate.revision - 1,
    })
  ).response.status,
  409,
);
const archivedCandidate = await request("/api/editor/import", {
  action: "archive",
  id: candidate.id,
  revision: candidate.revision,
});
assert.equal(archivedCandidate.response.status, 200);
assert.equal(archivedCandidate.data.record.status, "archived");
assert.equal(
  (
    await request("/api/editor/content", {
      ...linkedEdit.data,
      status: "archived",
    })
  ).response.status,
  200,
);
assert.equal(
  (
    await request("/api/editor/content", {
      kind: "opportunity",
      payload,
      status: "published",
      verified: false,
    })
  ).response.status,
  400,
);
const draft = await request("/api/editor/content", {
  kind: "opportunity",
  payload,
  status: "draft",
  verified: false,
});
assert.equal(draft.response.status, 201);
let record = draft.data;
assert.equal((await fetch(base + "/convocatorias/" + record.slug)).status, 404);
let result = await request("/api/editor/content", {
  ...record,
  status: "published",
  verified: true,
});
assert.equal(result.response.status, 200);
record = result.data;
assert.equal((await fetch(base + "/convocatorias/" + record.slug)).status, 200);
const stale = record;
result = await request("/api/editor/content", {
  ...record,
  payload: { ...payload, title: "Prueba actualizada " + tag },
  verified: true,
});
assert.equal(result.response.status, 200);
record = result.data;
assert.equal(record.slug, stale.slug);
assert.equal(
  (await request("/api/editor/content", { ...stale, status: "draft" })).response
    .status,
  409,
);
assert.equal(
  (
    await request("/api/editor/content", {
      ...record,
      payload: { ...payload, sourceUrl: "javascript:alert(1)" },
    })
  ).response.status,
  400,
);
const guide = {
  title: "Guía de pruebas " + tag,
  description:
    "Contenido de comprobación local para validar la publicación y archivo de guías originales.",
  category: "Pruebas",
  body: [...Array(4)].map(
    (_, i) =>
      "Párrafo " +
      i +
      ". Este texto es exclusivamente una prueba funcional del editor. Permite comprobar que una guía puede guardarse en el servidor y consultarse desde su página pública de forma consistente. No se usa como contenido editorial real.",
  ),
};
let article = await request("/api/editor/content", {
  kind: "article",
  payload: guide,
  status: "published",
  verified: true,
});
assert.equal(article.response.status, 201);
assert.equal((await fetch(base + "/blog/" + article.data.slug)).status, 200);
assert.equal(
  (
    await request("/api/contact", {
      name: "Prueba",
      email: "incorrecto",
      subject: "Prueba",
      message: "Mensaje de prueba local para comprobar validación.",
    })
  ).response.status,
  400,
);
const contactEmail = "prueba-" + tag + "@example.com";
const message = await request("/api/contact", {
  name: "Prueba funcional local",
  email: contactEmail,
  subject: "Prueba de bandeja",
  message: "Mensaje de pruebas locales, sin datos personales reales.",
});
assert.equal(message.response.status, 201);
assert.ok(message.data.reference);
const inbox = await request("/api/editor/content");
const received = inbox.data.find(
  (r) => r.kind === "message" && r.payload.email === contactEmail,
);
assert.ok(received);
assert.equal(
  (await request("/api/editor/content", { id: received.id, action: "resolve" }))
    .data.payload.resolved,
  true,
);
assert.equal(
  (await (await fetch(base + "/")).text()).includes(contactEmail),
  false,
);
const parallel = await Promise.all(
  [...Array(5)].map((_, i) =>
    request("/api/editor/content", {
      kind: "opportunity",
      payload: { ...payload, title: "Prueba concurrente " + tag + " " + i },
      status: "draft",
      verified: false,
    }),
  ),
);
assert.ok(parallel.every((r) => r.response.status === 201));
const after = await request("/api/editor/content");
assert.equal(
  after.data.filter((r) =>
    r.payload.title?.startsWith("Prueba concurrente " + tag),
  ).length,
  5,
);
for (const entry of [record, article.data, ...parallel.map((r) => r.data)])
  assert.equal(
    (
      await request("/api/editor/content", {
        ...entry,
        status: "archived",
        verified: true,
      })
    ).response.status,
    200,
  );
assert.equal((await fetch(base + "/convocatorias/" + record.slug)).status, 404);
assert.equal((await fetch(base + "/blog/" + article.data.slug)).status, 404);
const ads = await fetch(base + "/ads.txt");
assert.equal(ads.status, 404);
const home = await (await fetch(base + "/")).text();
assert.equal(home.includes("pagead2.googlesyndication.com/pagead/js"), false);
assert.equal(
  (await request("/api/editor/session", undefined, "DELETE")).response.status,
  200,
);
cookie = "";
assert.equal((await request("/api/editor/content")).response.status, 401);
console.log(
  "OK: autenticación, CSRF, importación privada, enlace editorial sin duplicados, revisión de cambios, publicación, edición, archivo, consultas privadas, escritura concurrente y anuncios desactivados.",
);
