import { runAutomaticImport, validCronRequest } from "@/lib/import-automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
export async function GET(request: Request) {
  if (!validCronRequest(request))
    return Response.json({ error: "Acceso no autorizado." }, { status: 401 });
  if (new URL(request.url).searchParams.get("ready") === "1")
    return Response.json(
      { ready: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  try {
    const result = await runAutomaticImport();
    return Response.json(result, {
      status: "status" in result && result.status === "error" ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      {
        error:
          "No se pudo guardar la ejecución automática. Revisa el almacenamiento del portal.",
      },
      { status: 503 },
    );
  }
}
