import { randomBytes, scryptSync } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
const filename = new URL("../.env.local", import.meta.url);
let current = "";
try {
  current = await readFile(filename, "utf8");
} catch {}
const existingAccess = /^ADMIN_PASSWORD_HASH=\S+/m.test(current);
const password = randomBytes(18).toString("base64url"),
  salt = randomBytes(16).toString("hex"),
  secret = randomBytes(48).toString("hex");
const variables = {
  ADMIN_EMAIL:
    current.match(/^ADMIN_EMAIL=(\S+)$/m)?.[1] || "admin@convocaperu.local",
  ADMIN_PASSWORD_HASH:
    salt + ":" + scryptSync(password, salt, 64).toString("hex"),
  SESSION_SECRET: secret,
  PORTAL_DEMO_MODE: "true",
  SITE_INDEXABLE: "false",
  NEXT_PUBLIC_ADSENSE_ENABLED: "false",
  NEXT_PUBLIC_ADSENSE_PREVIEW: "true",
  NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3060",
  CRON_SECRET: randomBytes(48).toString("hex"),
  AUTO_IMPORT_ENABLED: "true",
  AUTO_IMPORT_INTERVAL_MINUTES: "60",
};
for (const [key, value] of Object.entries(variables)) {
  const line = new RegExp("^" + key + "=[^\\r\\n]*", "m");
  const existing = current.match(line)?.[0];
  if (!existing) current += "\n" + key + "=" + value;
  else if (!existing.slice(key.length + 1).trim())
    current = current.replace(line, key + "=" + value);
}
await writeFile(filename, current.trim() + "\n", { mode: 0o600 });
if (!existingAccess)
  await writeFile(
    new URL("../.local-admin.txt", import.meta.url),
    "ACCESO LOCAL · CONVOCA PERÚ\nURL: http://127.0.0.1:3060/admin\nCorreo: " +
      variables.ADMIN_EMAIL +
      "\nContraseña: " +
      password +
      "\n\nArchivo privado ignorado por Git. No publiques esta contraseña.\n",
    { mode: 0o600 },
  );
console.log(
  existingAccess
    ? "Configuración automática local preparada. Se conservaron las credenciales editoriales."
    : "Acceso y búsqueda automática configurados. Las credenciales están en .local-admin.txt y no se añadieron a Git.",
);
