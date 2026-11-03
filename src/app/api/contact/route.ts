import { assertOrigin, rateLimit } from "@/lib/editor-auth";
import { contactRecord } from "@/lib/portal-validation";
import { saveRecord } from "@/lib/portal-store";
import { readJsonBody, RequestBodyError } from "@/lib/request-body";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    const body = await readJsonBody(request,16000);
    if (body.website)
      return Response.json(
        { error: "No se pudo registrar el mensaje." },
        { status: 400 },
      );
    let record: ReturnType<typeof contactRecord>;
    try {
      record = contactRecord(body);
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Revisa los datos de la consulta.",
        },
        { status: 400 },
      );
    }
    try {
      if (!(await rateLimit(request, "contact", 4, 600)))
        return Response.json(
          { error: "Has enviado varios mensajes. Inténtalo en unos minutos." },
          { status: 429 },
        );
      await saveRecord(record);
    } catch {
      return Response.json(
        {
          error:
            "El formulario no está disponible en este momento. Guarda un borrador y vuelve a intentarlo más tarde.",
        },
        { status: 503 },
      );
    }
    return Response.json(
      { ok: true, reference: record.id.slice(0, 8).toUpperCase() },
      { status: 201 },
    );
  } catch(error) {
    return Response.json(
      {
        error:
          "La solicitud no es válida. Revisa los datos y vuelve a intentarlo.",
      },
      { status: error instanceof RequestBodyError ? error.status : 400 },
    );
  }
}
