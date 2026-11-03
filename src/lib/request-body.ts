import "server-only";
export class RequestBodyError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
// Enforce the limit on actual bytes, including chunked bodies without Content-Length.
export async function readJsonBody(
  request: Request,
  limit: number,
): Promise<Record<string, unknown>> {
  if (
    request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    throw new RequestBodyError("Se requiere JSON.", 415);
  if (Number(request.headers.get("content-length")) > limit)
    throw new RequestBodyError("La solicitud es demasiado grande.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestBodyError("La solicitud está vacía.");
  const parts: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > limit)
        throw new RequestBodyError("La solicitud es demasiado grande.", 413);
      parts.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  try {
    const result: unknown = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(parts)),
    );
    if (!result || typeof result !== "object" || Array.isArray(result))
      throw new Error();
    return result as Record<string, unknown>;
  } catch {
    throw new RequestBodyError("El JSON no es válido.");
  }
}
