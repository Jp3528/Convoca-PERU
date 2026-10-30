import "server-only";
import {
  readFile,
  writeFile,
  mkdir,
  rename,
  open,
  unlink,
  stat,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  opportunities,
  articles,
  type Opportunity,
  type Article,
} from "./data";
import type { Catalog, PortalRecord } from "./portal-types";
import { demoEnabled } from "./portal-config";
import initialArticles from "../../content/initial-articles.json";
import type { ImportJob } from "./import-types";
import { publicDiscoveries } from "./discoveries";
import { supabaseAuthHeaders } from "./supabase-auth.mjs";

export function storageProvider() {
  return process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "supabase"
    : process.env.VERCEL
      ? "unconfigured"
      : "local";
}
const filename =
  process.env.LOCAL_DATA_DIR === ".data-tests"
    ? path.join(process.cwd(), ".data-tests", "portal.json")
    : path.join(process.cwd(), ".data", "portal.json");
const directory = path.dirname(filename);
const jobFilename = path.join(directory, "import-automation.json");
let queue = Promise.resolve();
async function exclusive<T>(action: () => Promise<T>) {
  const previous = queue;
  let release!: () => void;
  queue = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  let lock: Awaited<ReturnType<typeof open>> | undefined;
  try {
    await mkdir(directory, { recursive: true });
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        lock = await open(filename + ".lock", "wx");
        break;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        try {
          if (Date.now() - (await stat(filename + ".lock")).mtimeMs > 30000)
            await unlink(filename + ".lock");
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }
    if (!lock)
      throw new Error("El almacenamiento está ocupado. Vuelve a intentarlo.");
    return await action();
  } finally {
    if (lock) {
      await lock.close();
      await unlink(filename + ".lock").catch(() => {});
    }
    release();
  }
}
async function localRead(): Promise<PortalRecord[]> {
  try {
    return JSON.parse(await readFile(filename, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await mkdir(directory, { recursive: true });
    const timestamp = new Date().toISOString();
    const seed: PortalRecord[] = [
      ...(initialArticles as PortalRecord[]),
      ...opportunities.map((payload) => ({
        id: randomUUID(),
        kind: "opportunity" as const,
        slug: payload.slug,
        payload,
        status: "published" as const,
        sample: true,
        verified: false,
        created_at: timestamp,
        updated_at: timestamp,
        revision: 1,
      })),
      ...articles.map((payload) => ({
        id: randomUUID(),
        kind: "article" as const,
        slug: payload.slug,
        payload,
        status: "published" as const,
        sample: true,
        verified: false,
        created_at: timestamp,
        updated_at: timestamp,
        revision: 1,
      })),
    ];
    await localWrite(seed);
    return seed;
  }
}
async function localWrite(records: PortalRecord[]) {
  await mkdir(directory, { recursive: true });
  const temp = filename + "." + randomUUID() + ".tmp";
  await writeFile(temp, JSON.stringify(records, null, 2), { mode: 0o600 });
  await rename(temp, filename);
}
export async function supabaseRequest(
  resource: string,
  options: RequestInit = {},
) {
  const base = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const response = await fetch(
    base.replace(/\/$/, "") + "/rest/v1/" + resource,
    {
      ...options,
      cache: "no-store",
      headers: {
        ...supabaseAuthHeaders(key),
        "Content-Type": "application/json",
        ...options.headers,
      },
      signal: AbortSignal.timeout(12000),
    },
  );
  if (!response.ok)
    throw new Error(
      "No se pudo consultar la base de datos. Revisa la conexión y la migración del portal.",
    );
  return response.status === 204 ? null : response.json();
}
export async function getRecords(): Promise<PortalRecord[]> {
  if (storageProvider() === "unconfigured") return [];
  if (storageProvider() === "supabase")
    return supabaseRequest(
      "portal_documents?select=*&order=updated_at.desc&limit=1000",
    );
  return exclusive(localRead);
}
export async function saveRecord(
  record: PortalRecord,
  expectedRevision?: number,
): Promise<PortalRecord> {
  if (storageProvider() === "unconfigured")
    throw new Error("Configura Supabase antes de guardar datos en Vercel.");
  if (storageProvider() === "supabase") {
    if (expectedRevision !== undefined) {
      const rows = await supabaseRequest(
        "portal_documents?id=eq." +
          record.id +
          "&revision=eq." +
          expectedRevision,
        {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(record),
        },
      );
      if (!rows?.length)
        throw new Error(
          "El contenido cambió. Recarga el panel antes de volver a guardarlo.",
        );
      return rows[0];
    }
    const rows = await supabaseRequest("portal_documents", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(record),
    });
    return rows[0];
  }
  return exclusive(async () => {
    const records = await localRead();
    const existing = records.find((r) => r.id === record.id);
    if (existing && expectedRevision === undefined)
      throw new Error(
        "El contenido ya existe. Recarga antes de volver a guardarlo.",
      );
    if (
      expectedRevision !== undefined &&
      existing?.revision !== expectedRevision
    )
      throw new Error(
        "El contenido cambió. Recarga el panel antes de volver a guardarlo.",
      );
    if (
      record.kind !== "message" &&
      records.some(
        (r) =>
          r.kind === record.kind &&
          r.slug === record.slug &&
          r.id !== record.id,
      )
    )
      throw new Error(
        "Ya existe contenido con esa dirección. Cambia el título o el slug.",
      );
    await localWrite([record, ...records.filter((r) => r.id !== record.id)]);
    return record;
  });
}
export async function getCatalog(): Promise<Catalog> {
  const records: PortalRecord[] =
    storageProvider() === "supabase"
      ? await supabaseRequest(
          "portal_documents?select=*&status=eq.published&kind=in.(opportunity,article)&order=updated_at.desc&limit=1000",
        )
      : await getRecords();
  const includeSamples = storageProvider() === "local" || demoEnabled();
  const published = records.filter(
    (r) => r.status === "published" && (r.sample ? includeSamples : r.verified),
  );
  return {
    opportunities: published
      .filter((r) => r.kind === "opportunity")
      .map((r) => ({ ...r.payload, isSample: r.sample }) as Opportunity),
    articles: published
      .filter((r) => r.kind === "article")
      .map((r) => ({ ...r.payload, isSample: r.sample }) as Article),
    demo: published.some((r) => r.sample),
    available: storageProvider() !== "unconfigured",
  };
}

async function localJobRead(): Promise<ImportJob | null> {
  try {
    return JSON.parse(await readFile(jobFilename, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
async function localJobWrite(job: ImportJob) {
  const temp = jobFilename + "." + randomUUID() + ".tmp";
  await writeFile(temp, JSON.stringify(job, null, 2), { mode: 0o600 });
  await rename(temp, jobFilename);
}
export async function getImportJob(): Promise<ImportJob | null> {
  if (storageProvider() === "unconfigured") return null;
  if (storageProvider() === "supabase") {
    const rows = await supabaseRequest(
      "portal_import_automation?key=eq.main&select=state&limit=1",
    );
    return rows[0]?.state || null;
  }
  return exclusive(localJobRead);
}
export async function getDiscoveries() {
  const records: PortalRecord[] =
    storageProvider() === "supabase"
      ? await supabaseRequest(
          "portal_documents?select=*&kind=eq.import&status=eq.draft&order=updated_at.desc&limit=500",
        )
      : await getRecords();
  return publicDiscoveries(records);
}
export async function claimImportJob(job: ImportJob): Promise<boolean> {
  if (storageProvider() === "unconfigured")
    throw new Error(
      "Configura Supabase antes de activar la búsqueda automática.",
    );
  if (storageProvider() === "supabase")
    return !!(await supabaseRequest("rpc/claim_import_job", {
      method: "POST",
      body: JSON.stringify({ job_token: job.leaseToken, initial_state: job }),
    }));
  return exclusive(async () => {
    const previous = await localJobRead(),
      now = Date.now();
    if (
      previous &&
      (Date.parse(previous.leaseUntil) > now ||
        Date.parse(previous.nextRunAt) > now)
    )
      return false;
    await localJobWrite(job);
    return true;
  });
}
export async function finishImportJob(job: ImportJob): Promise<boolean> {
  if (storageProvider() === "supabase")
    return !!(await supabaseRequest("rpc/complete_import_job", {
      method: "POST",
      body: JSON.stringify({ job_token: job.leaseToken, completed_state: job }),
    }));
  return exclusive(async () => {
    const previous = await localJobRead();
    if (!previous || previous.leaseToken !== job.leaseToken) return false;
    await localJobWrite(job);
    return true;
  });
}
