import "server-only";
import { createHash } from "node:crypto";
import { daysUntil } from "./data";
import { getRecords, saveRecord, storageProvider } from "./portal-store";
import {
  candidateSlug,
  parseMtcCas,
  parseProinversion,
  robotsAllows,
} from "./import-parser";
import {
  importSources,
  type ImportCandidate,
  type ImportReport,
} from "./import-types";
import type { PortalRecord } from "./portal-types";

const userAgent =
  "ConvocaPeruImporter/1.0 (public job listings; editorial review)";
const maxBytes = 2_000_000;

async function readPublic(url: string, robots = false) {
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(12000),
    headers: {
      "User-Agent": userAgent,
      Accept: robots ? "text/plain" : "text/html",
    },
  });
  // RFC 9309 §2.3.1.3: a robots file returning 4xx is unavailable.
  // 429 still stops the scan; denied source pages are never retried or bypassed.
  if (
    robots &&
    response.status >= 400 &&
    response.status < 500 &&
    response.status !== 429
  )
    return "";
  if (!response.ok)
    throw new Error(
      `La fuente oficial respondió ${response.status}. Vuelve a intentarlo más tarde.`,
    );
  const contentType = response.headers.get("content-type") || "";
  if (!robots && !contentType.toLowerCase().includes("text/html"))
    throw new Error("La fuente ya no devuelve un listado HTML compatible.");
  if (Number(response.headers.get("content-length")) > maxBytes)
    throw new Error("La respuesta de la fuente supera el límite permitido.");
  if (!response.body) throw new Error("La fuente no devolvió contenido.");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes)
        throw new Error(
          "La respuesta de la fuente supera el límite permitido.",
        );
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const charset =
    contentType.match(/charset\s*=\s*["']?([^;\s"']+)/i)?.[1] || "utf-8";
  return new TextDecoder(charset).decode(Buffer.concat(chunks));
}

export async function ingestCandidates(
  candidates: ImportCandidate[],
  sourceId: string,
  checkedAt: string,
) {
  const report: ImportReport = {
    sourceId,
    checkedAt,
    found: candidates.length,
    created: 0,
    updated: 0,
    unchanged: 0,
    conflicts: 0,
    expired: 0,
  };
  const records = await getRecords();
  const seen = new Set(
    candidates.map((candidate) =>
      candidateSlug(
        candidate.sourceId,
        candidate.externalId || candidate.reference,
      ),
    ),
  );
  for (const candidate of candidates) {
    const slug = candidateSlug(
      candidate.sourceId,
      candidate.externalId || candidate.reference,
    );
    const previous = records.find(
      (r) => r.kind === "import" && r.slug === slug,
    );
    const old = previous?.payload as ImportCandidate | undefined;
    const digest = createHash("sha256").update(slug).digest("hex");
    // A stable ID and unique slug also prevent duplicate inserts across workers.
    const id = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-5${digest.slice(13, 16)}-a${digest.slice(17, 20)}-${digest.slice(20, 32)}`;
    const record: PortalRecord = {
      id: previous?.id || id,
      kind: "import",
      slug,
      payload: { ...candidate, firstSeenAt: old?.firstSeenAt || checkedAt },
      status: previous?.status === "archived" ? "archived" : "draft",
      sample: false,
      verified: false,
      created_at: previous?.created_at || checkedAt,
      updated_at: checkedAt,
      revision: (previous?.revision || 0) + 1,
    };
    if (daysUntil(candidate.endsAt, new Date(checkedAt)) < 0) report.expired++;
    try {
      await saveRecord(record, previous?.revision);
      if (!previous) report.created++;
      else if (old?.fingerprint !== candidate.fingerprint) report.updated++;
      else report.unchanged++;
    } catch (error) {
      // A competing scan/editor may have saved it. Never overwrite that revision.
      const latest = (await getRecords()).find(
        (r) => r.kind === "import" && r.slug === slug,
      );
      if (latest && (!previous || latest.revision !== previous.revision))
        report.conflicts++;
      else throw error;
    }
  }
  for (const previous of records.filter(
    (r) =>
      r.kind === "import" &&
      (r.payload as ImportCandidate).sourceId === sourceId &&
      !seen.has(r.slug),
  )) {
    const payload = previous.payload as ImportCandidate;
    if (payload.noLongerListedAt) continue;
    try {
      await saveRecord(
        {
          ...previous,
          payload: { ...payload, noLongerListedAt: checkedAt },
          updated_at: checkedAt,
          revision: previous.revision + 1,
        },
        previous.revision,
      );
      report.removed = (report.removed || 0) + 1;
    } catch {
      report.conflicts++;
    }
  }
  return report;
}

export async function scanSource(sourceId: string) {
  const source = importSources.find((s) => s.id === sourceId);
  if (!source) throw new Error("Selecciona una fuente disponible.");
  if (storageProvider() === "unconfigured")
    throw new Error("Conecta Supabase antes de importar en Vercel.");
  const target = new URL(source.url);
  // All destinations come from this fixed registry; URLs supplied by clients are never fetched.
  const robots = await readPublic(target.origin + "/robots.txt", true);
  if (!robotsAllows(robots, target.pathname + target.search))
    throw new Error(
      "La fuente no permite esta consulta automática. Revisa sus condiciones.",
    );
  const html = await readPublic(source.url);
  const checkedAt = new Date().toISOString();
  const candidates =
    source.id === "mtc-cas"
      ? parseMtcCas(html, checkedAt)
      : parseProinversion(html, checkedAt);
  // Parsing is completed and validated before the first write. No missing fields are inferred.
  return ingestCandidates(candidates, source.id, checkedAt);
}
