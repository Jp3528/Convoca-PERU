import {
  authConfigured,
  validPassword,
  createSession,
  endSession,
  assertOrigin,
  rateLimit,
} from "@/lib/editor-auth";
export async function POST(request: Request) {
  try {
    assertOrigin(request);
    if (!authConfigured())
      return Response.json(
        { error: "El acceso editorial aún no está configurado." },
        { status: 503 },
      );
    if (!(await rateLimit(request, "login", 5, 900)))
      return Response.json(
        { error: "Demasiados intentos. Vuelve a intentarlo en 15 minutos." },
        { status: 429 },
      );
    const body = await request.json();
    if (
      typeof body.email !== "string" ||
      body.email.toLowerCase().trim() !==
        process.env.ADMIN_EMAIL?.toLowerCase() ||
      typeof body.password !== "string" ||
      !validPassword(body.password)
    )
      return Response.json(
        { error: "Correo o contraseña incorrectos." },
        { status: 401 },
      );
    await createSession();
    return Response.json({ ok: true });
  } catch (error) {
    console.error(
      "No se pudo procesar el acceso editorial:",
      error instanceof Error ? error.message : "Error interno",
    );
    return Response.json(
      { error: "No se pudo iniciar sesión." },
      { status: 400 },
    );
  }
}
export async function DELETE(request: Request) {
  try {
    assertOrigin(request);
    await endSession();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Solicitud no permitida." }, { status: 403 });
  }
}
