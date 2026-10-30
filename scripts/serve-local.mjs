import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const mode = process.argv[2] === "dev" ? "dev" : "start";
const port = Number(process.env.LOCAL_PORT || 3060);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("LOCAL_PORT no es válido.");
const secret = process.env.CRON_SECRET || "";
const enabled = process.env.AUTO_IMPORT_ENABLED === "true";
if (enabled && secret.length < 32)
  throw new Error(
    "Ejecuta npm run setup:local para configurar la búsqueda automática.",
  );
if (process.env.VERCEL)
  throw new Error(
    "Este comando es solo para el servidor local. Vercel usa el cron configurado.",
  );
const base = `http://127.0.0.1:${port}`;
const child = spawn(
  process.execPath,
  [
    fileURLToPath(
      new URL("../node_modules/next/dist/bin/next", import.meta.url),
    ),
    mode,
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    stdio: "inherit",
    env: { ...process.env, LOCAL_IMPORT_WORKER: enabled ? "true" : "false" },
    windowsHide: true,
  },
);
let stopped = false,
  timer;
function stop() {
  stopped = true;
  clearTimeout(timer);
  child.kill();
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("error", (error) => {
  console.error("No se pudo iniciar el servidor:", error.message);
  process.exitCode = 1;
  stop();
});
child.on("exit", (code) => {
  stopped = true;
  clearTimeout(timer);
  process.exitCode = code || 0;
});
async function tick() {
  if (stopped) return;
  try {
    const response = await fetch(base + "/api/cron/import", {
      headers: { Authorization: "Bearer " + secret },
      signal: AbortSignal.timeout(125000),
    });
    const result = await response.json();
    if (result.status)
      console.log(
        `[Búsqueda automática] ${result.status}: ${(result.reports || []).reduce((n, r) => n + r.found, 0)} hallazgos; próxima ejecución ${result.nextRunAt}.`,
      );
    else if (!response.ok)
      console.error(
        "[Búsqueda automática] No se pudo completar. Revisa el estado en el panel.",
      );
  } catch {
    if (!stopped)
      console.error(
        "[Búsqueda automática] Sin conexión con el servidor. Se volverá a comprobar en un minuto.",
      );
  }
  if (!stopped) timer = setTimeout(tick, 60000);
}
async function startWorker() {
  for (let attempt = 0; attempt < 90 && !stopped; attempt++) {
    try {
      const response = await fetch(base + "/api/cron/import?ready=1", {
        headers: { Authorization: "Bearer " + secret },
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        console.log(
          "[Búsqueda automática] Servicio activo. Funciona aunque cierres la pestaña del navegador.",
        );
        await tick();
        return;
      }
      if (response.status === 401) {
        console.error(
          "[Búsqueda automática] La clave privada no coincide. Reinicia el servidor con npm run start:local.",
        );
        return;
      }
    } catch {}
    await new Promise((resolve) => {
      timer = setTimeout(resolve, 1000);
    });
  }
  if (!stopped) {
    console.error(
      "[Búsqueda automática] El servidor tarda en responder. Se reintentará en un minuto.",
    );
    timer = setTimeout(startWorker, 60000);
  }
}
if (enabled) void startWorker();
