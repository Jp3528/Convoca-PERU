import { currentEditor, assertOrigin } from "@/lib/editor-auth";
import { getRecords, saveRecord, storageProvider } from "@/lib/portal-store";
import { contentRecord } from "@/lib/portal-validation";
import type { ImportCandidate } from "@/lib/import-types";
import type { Opportunity } from "@/lib/data";
import { readJsonBody } from "@/lib/request-body";
export async function GET() {
  if (!(await currentEditor()))
    return Response.json({ error: "Inicia sesión." }, { status: 401 });
  return Response.json(await getRecords(), {
    headers: {
      "Cache-Control": "no-store",
      "X-Portal-Storage": storageProvider(),
      "X-Portal-Test-Storage":
        process.env.LOCAL_DATA_DIR === ".data-tests" ? "true" : "false",
    },
  });
}
export async function POST(request: Request) {
  if (!(await currentEditor()))
    return Response.json({ error: "Inicia sesión." }, { status: 401 });
  try {
    assertOrigin(request);
    const body = await readJsonBody(request,100000);
    const previous = body.id
      ? (await getRecords()).find((r) => r.id === body.id)
      : undefined;
    if (body.id && !previous)
      return Response.json(
        { error: "El contenido ya no está disponible." },
        { status: 404 },
      );
    if (previous?.kind === "import")
      throw new Error("Revisa el borrador desde la pestaña Importar.");
    if (previous?.kind === "message") {
      if (body.action !== "resolve" && body.action !== "reopen")
        throw new Error("Acción no válida.");
      const record = {
        ...previous,
        payload: { ...previous.payload, resolved: body.action === "resolve" },
        updated_at: new Date().toISOString(),
        revision: previous.revision + 1,
      };
      await saveRecord(record, previous.revision);
      return Response.json(record);
    }
    if (previous && body.revision !== previous.revision)
      return Response.json(
        { error: "El contenido cambió. Recarga antes de guardar." },
        { status: 409 },
      );
    const record = contentRecord(body, previous);
    if (body.importId) {
      const candidateRecord = (await getRecords()).find(
        (r) =>
          r.kind === "import" && r.id === body.importId && r.status === "draft",
      );
      if (!candidateRecord || record.kind !== "opportunity")
        throw new Error("El borrador importado ya no está disponible.");
      if (
        previous &&
        (previous.payload as Opportunity).importProvenance?.candidateId !==
          candidateRecord.id
      )
        throw new Error("Esta ficha pertenece a otra fuente.");
      const candidate = candidateRecord.payload as ImportCandidate;
      if (candidate.fingerprint !== body.importFingerprint)
        return Response.json(
          {
            error:
              "La fuente cambió. Abre de nuevo el borrador importado antes de guardarlo.",
          },
          { status: 409 },
        );
      // Stable slug enforces one editorial entry per source reference, even on concurrent saves.
      if (!previous) record.slug = "convocatoria-" + candidateRecord.slug;
      const payload = record.payload as Opportunity;
      payload.slug = record.slug;
      payload.importProvenance = {
        candidateId: candidateRecord.id,
        sourceId: candidate.sourceId,
        reference: candidate.reference,
        fingerprint: candidate.fingerprint,
        preparedAt: new Date().toISOString(),
      };
    }
    await saveRecord(record, previous?.revision);
    return Response.json(record, { status: previous ? 200 : 201 });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el contenido.",
      },
      { status: 400 },
    );
  }
}
