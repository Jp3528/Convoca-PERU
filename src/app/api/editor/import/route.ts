import { assertOrigin, currentEditor, rateLimit } from "@/lib/editor-auth";
import { getRecords, saveRecord } from "@/lib/portal-store";
import { scanSource } from "@/lib/import-service";
import { importSources } from "@/lib/import-types";
import { automationStatus } from "@/lib/import-automation";
import { readJsonBody } from "@/lib/request-body";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  if (!(await currentEditor()))
    return Response.json({ error: "Inicia sesión." }, { status: 401 });
  try {
    return Response.json(
      { automation: await automationStatus(), records: await getRecords() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "No se pudo actualizar el estado de la búsqueda." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await currentEditor()))
    return Response.json({ error: "Inicia sesión." }, { status: 401 });
  try {
    assertOrigin(request);
    const body = await readJsonBody(request,2000);
    if (body.action === "scan") {
      const sourceId = typeof body.sourceId === "string" ? body.sourceId : "";
      if (!importSources.some((s) => s.id === sourceId))
        return Response.json(
          { error: "Selecciona una fuente disponible." },
          { status: 400 },
        );
      if (!(await rateLimit(request, "import-scan", 1, 300)))
        return Response.json(
          {
            error: "Espera cinco minutos entre consultas a la fuente oficial.",
          },
          { status: 429 },
        );
      const report = await scanSource(sourceId);
      return Response.json(
        { report, records: await getRecords() },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (body.action !== "archive" && body.action !== "reopen")
      throw new Error("Acción no válida.");
    const previous = (await getRecords()).find(
      (r) => r.id === body.id && r.kind === "import",
    );
    if (!previous)
      return Response.json(
        { error: "El borrador importado ya no está disponible." },
        { status: 404 },
      );
    if (body.revision !== previous.revision)
      return Response.json(
        { error: "El borrador cambió. Recarga antes de continuar." },
        { status: 409 },
      );
    const record = {
      ...previous,
      status:
        body.action === "archive" ? ("archived" as const) : ("draft" as const),
      revision: previous.revision + 1,
      updated_at: new Date().toISOString(),
    };
    await saveRecord(record, previous.revision);
    return Response.json({ record });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo consultar la fuente. Vuelve a intentarlo más tarde.",
      },
      { status: 400 },
    );
  }
}
