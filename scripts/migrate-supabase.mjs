import fs from "node:fs/promises";
import { supabaseAuthHeaders } from "../src/lib/supabase-auth.mjs";
let records;
try {
  records = JSON.parse(
    await fs.readFile(new URL("../.data/portal.json", import.meta.url), "utf8"),
  );
} catch {
  records = JSON.parse(
    await fs.readFile(
      new URL("../content/initial-articles.json", import.meta.url),
      "utf8",
    ),
  );
}
const selected = records.filter((r) => !r.sample && r.kind !== "message");
console.log("Contenido para migrar:", selected.length);
for (const item of selected)
  console.log(item.kind + " · " + item.status + " · " + item.slug);
if (!process.argv.includes("--apply")) {
  console.log(
    "Simulación: no se enviaron datos. Para aplicar: npm run migrate:supabase:apply",
  );
  process.exit(0);
}
const base = process.env.SUPABASE_URL,
  key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base?.startsWith("https://") || !key)
  throw new Error(
    "Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.",
  );
if (!selected.length) {
  console.log("No hay contenido real para migrar.");
  process.exit(0);
}
const response = await fetch(
  base.replace(/\/$/, "") + "/rest/v1/portal_documents?on_conflict=id",
  {
    method: "POST",
    headers: {
      ...supabaseAuthHeaders(key),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(selected),
    signal: AbortSignal.timeout(20000),
  },
);
if (!response.ok)
  throw new Error(
    "No se pudo migrar. Revisa la conexión, la migración SQL y los slugs existentes. No se borraron registros.",
  );
console.log(
  "Contenido guardado en Supabase. Las consultas privadas y las muestras no se migraron.",
);
