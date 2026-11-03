import "server-only";
import { extractText, getDocumentProxy } from "unpdf";
import {
  parseOfficialDetailPage,
  parseOfficialProfile,
  safeOfficialDocument,
} from "./job-details";
import type { ImportCandidate } from "./import-types";
import { robotsAllows } from "./import-parser";
import { PROFILE_EXTRACTOR_VERSION } from "./job-public";

async function publicBytes(url: string, kind: "html" | "pdf") {
  const response = await fetch(url, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
    headers: {
      "User-Agent": "ConvocaPeruImporter/1.0 (public job profiles)",
      Accept: kind === "pdf" ? "application/pdf" : "text/html",
    },
  });
  if (
    !response.ok ||
    !response.headers
      .get("content-type")
      ?.toLowerCase()
      .includes(kind === "pdf" ? "application/pdf" : "text/html")
  )
    throw new Error("Perfil oficial no disponible.");
  const limit = kind === "pdf" ? 3_000_000 : 2_000_000;
  if (Number(response.headers.get("content-length")) > limit || !response.body)
    throw new Error("Perfil demasiado grande.");
  const reader = response.body.getReader();
  let size = 0;
  const parts: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error("Perfil demasiado grande.");
      parts.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const data = Buffer.concat(parts);
  if (kind === "pdf" && data.subarray(0, 5).toString() !== "%PDF-")
    throw new Error("El documento no es un PDF.");
  return data;
}

export async function enrichOfficialCandidate(
  candidate: ImportCandidate,
  robots: string,
) {
  const page = new URL(candidate.sourceUrl);
  if (
    page.origin !== "https://www.investinperu.pe" ||
    !/^\/convocatorias-laborales\/[a-z0-9-]+\/$/.test(page.pathname) ||
    page.search ||
    page.hash ||
    page.username ||
    page.password ||
    !robotsAllows(robots, page.pathname)
  )
    throw new Error("Ficha no autorizada.");
  const { documents, area } = parseOfficialDetailPage(
    (await publicBytes(page.toString(), "html")).toString("utf8"),
  );
  const profile = documents.find(
    (doc) => /perfil.*cronograma/i.test(doc.label) && /\.pdf$/i.test(doc.url),
  );
  const checkedAt = new Date().toISOString();
  const details = {
    extractorVersion: PROFILE_EXTRACTOR_VERSION,
    requirements: [] as string[],
    responsibilities: [] as string[],
    documents,
    area,
    checkedAt,
    listingFingerprint: candidate.fingerprint,
  };
  if (profile) {
    const safeUrl = safeOfficialDocument(profile.url);
    if (!safeUrl || !robotsAllows(robots, new URL(safeUrl).pathname))
      throw new Error("Documento no autorizado.");
    const data = await publicBytes(safeUrl, "pdf");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const parse = async () => {
      const pdf = await getDocumentProxy(new Uint8Array(data), {
        maxImageSize: 1_000_000,
        useSystemFonts: false,
      });
      if (pdf.numPages > 12)
        throw new Error("El perfil supera el límite de páginas.");
      return extractText(pdf, { mergePages: true });
    };
    const { text } = await Promise.race([
      parse(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Tiempo de lectura agotado.")),
          4000,
        );
      }),
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });
    if (text.length > 80000)
      throw new Error("El perfil supera el límite de texto.");
    Object.assign(details, parseOfficialProfile(text));
  }
  return { ...candidate, details };
}
