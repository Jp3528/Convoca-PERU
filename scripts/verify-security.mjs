import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3061";
if (new URL(base).hostname !== "127.0.0.1" || new URL(base).port !== "3061")
  throw Error("Usa solo la instancia aislada en 3061.");
const origin = { Origin: base, "Content-Type": "application/json" };
async function post(path, body, headers = origin) {
  return fetch(base + path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}
const home = await fetch(base + "/");
assert.equal(home.status, 200);
for (const [name, value] of [
  ["x-frame-options", "DENY"],
  ["x-content-type-options", "nosniff"],
  ["referrer-policy", "strict-origin-when-cross-origin"],
])
  assert.equal(home.headers.get(name), value);
assert.match(home.headers.get("permissions-policy"), /camera=\(\)/);
for (const path of ["/.env.local", "/api%20key.txt", "/.local-admin.txt"]) {
  const r = await fetch(base + path);
  assert.equal(r.status, 404);
}
assert.equal((await fetch(base + "/api/editor/content")).status, 401);
assert.equal((await fetch(base + "/api/editor/import")).status, 401);
assert.equal((await fetch(base + "/api/cron/import")).status, 401);
assert.equal((await fetch(base + "/api/cv/coach")).status, 405);
for (const [body, headers, status] of [
  [{ jobKey: "missing", adult: true, cv: "PRIVATE_CV_CANARY" }, origin, 400],
  [
    { jobKey: "missing", adult: true },
    { ...origin, Origin: "https://attacker.invalid" },
    400,
  ],
  [{ jobKey: "https://127.0.0.1", adult: true }, origin, 400],
  [{ jobKey: "missing", adult: false }, origin, 400],
  [
    { jobKey: "missing", adult: true },
    { ...origin, "Content-Type": "text/plain" },
    415,
  ],
]) {
  const r = await post("/api/cv/coach", body, headers);
  assert.equal(r.status, status);
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal((await r.text()).includes("PRIVATE_CV_CANARY"), false);
}
for (const [path, size] of [
  ["/api/cv/coach", 701],
  ["/api/contact", 16001],
]) {
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode("x".repeat(size)));
      c.close();
    },
  });
  const r = await fetch(base + path, {
    method: "POST",
    headers: origin,
    body: stream,
    duplex: "half",
  });
  assert.equal(r.status, 413, "Limitar bytes reales sin Content-Length.");
}
for (let i = 0; i < 3; i++) {
  const r = await post("/api/cv/coach", {
    jobKey: "missing-public-job",
    adult: true,
  });
  assert.equal(r.status, i < 2 ? 404 : 429);
}
assert.equal(
  (await (await fetch(base + "/asistente-cv")).text()).includes(
    "pagead2.googlesyndication.com/pagead/js",
  ),
  false,
);
console.log(
  "OK HTTP: cabeceras, secretos inaccesibles, editor/cron privados, CSRF, CV rechazado, límites de bytes y frecuencia, asistente sin anuncios.",
);
