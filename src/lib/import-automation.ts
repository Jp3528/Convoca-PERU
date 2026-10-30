import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import {
  claimImportJob,
  finishImportJob,
  getImportJob,
  storageProvider,
} from "./portal-store";
import { scanSource } from "./import-service";
import {
  importSources,
  type AutomationStatus,
  type ImportJob,
} from "./import-types";

export function automaticInterval() {
  const value = Number(process.env.AUTO_IMPORT_INTERVAL_MINUTES || 60);
  return Number.isFinite(value)
    ? Math.max(15, Math.min(1440, Math.trunc(value)))
    : 60;
}
export function validCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET || "";
  if (secret.length < 32) return false;
  const actual = Buffer.from(request.headers.get("authorization") || "");
  const expected = Buffer.from("Bearer " + secret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function nextAutomaticRun(now: Date, failed = false) {
  if (process.env.VERCEL) {
    // vercel.json runs daily at 12:00 UTC (07:00 Lima; Hobby may run within that hour).
    const next = new Date(now);
    next.setUTCDate(next.getUTCDate() + 1);
    next.setUTCHours(12, 0, 0, 0);
    return next.toISOString();
  }
  return new Date(
    now.getTime() + Math.min(automaticInterval(), failed ? 15 : 1440) * 60000,
  ).toISOString();
}
export async function automationStatus(): Promise<AutomationStatus> {
  const state = await getImportJob();
  const visible = state ? { ...state } : null;
  if (visible) {
    delete (visible as Partial<ImportJob>).leaseToken;
    delete (visible as Partial<ImportJob>).leaseUntil;
  }
  return {
    enabled:
      process.env.AUTO_IMPORT_ENABLED === "true" &&
      (process.env.CRON_SECRET || "").length >= 32 &&
      storageProvider() !== "unconfigured",
    scheduler: process.env.VERCEL
      ? "vercel"
      : process.env.LOCAL_IMPORT_WORKER === "true"
        ? "local"
        : "missing",
    intervalMinutes: process.env.VERCEL ? 1440 : automaticInterval(),
    state: visible,
  };
}
export async function runAutomaticImport() {
  if (process.env.AUTO_IMPORT_ENABLED !== "true")
    return { skipped: "disabled" as const };
  const now = new Date();
  const job: ImportJob = {
    leaseToken: randomUUID(),
    leaseUntil: new Date(now.getTime() + 180000).toISOString(),
    status: "running",
    startedAt: now.toISOString(),
    finishedAt: null,
    nextRunAt: now.toISOString(),
    reports: [],
    errors: [],
  };
  if (!(await claimImportJob(job)))
    return {
      skipped: "not_due" as const,
      nextRunAt: (await getImportJob())?.nextRunAt,
    };
  for (const source of importSources) {
    try {
      job.reports.push(await scanSource(source.id));
    } catch (error) {
      job.errors.push({
        sourceId: source.id,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo consultar la fuente.",
      });
    }
  }
  const finishedAt = new Date();
  job.status = job.errors.length
    ? job.reports.length
      ? "partial"
      : "error"
    : "success";
  job.finishedAt = finishedAt.toISOString();
  job.leaseUntil = job.finishedAt;
  job.nextRunAt = nextAutomaticRun(finishedAt, job.errors.length > 0);
  if (!(await finishImportJob(job)))
    throw new Error(
      "La ejecución fue reemplazada. Revisa el estado antes de volver a consultar.",
    );
  return {
    status: job.status,
    reports: job.reports,
    errors: job.errors,
    nextRunAt: job.nextRunAt,
  };
}
