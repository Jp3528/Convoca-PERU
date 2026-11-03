import { assertOrigin, rateLimit } from "@/lib/editor-auth";
import { coachRequest } from "@/lib/cv-coach-contract";
import {
  coachEnabled,
  publicJobAdvice,
  transientCoachError,
} from "@/lib/cv-coach";
import { resolveCvJob } from "@/lib/cv-jobs";
import { readJsonBody, RequestBodyError } from "@/lib/request-body";
export const runtime = "nodejs";
export const maxDuration = 40;
const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex",
  "X-Content-Type-Options": "nosniff",
};
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers });
export async function POST(request: Request) {
  let input: ReturnType<typeof coachRequest>;
  try {
    assertOrigin(request);
    input = coachRequest(await readJsonBody(request, 700));
  } catch (error) {
    return reply(
      {
        error:
          "Solicitud no válida. Solo se admite la referencia de una convocatoria pública y la confirmación de mayoría de edad.",
      },
      error instanceof RequestBodyError ? error.status : 400,
    );
  }
  if (!coachEnabled())
    return reply(
      {
        error:
          "Los consejos de IA no están disponibles. El análisis local de tu CV sigue funcionando.",
      },
      503,
    );
  let stage = "connection-limit";
  try {
    if (!(await rateLimit(request, "cv-coach-daily", 2, 86400)))
      return reply(
        {
          error:
            "Has alcanzado el límite de 2 consultas con Gemini cada 24 horas. Puedes consultar la guía del perfil.",
        },
        429,
      );
    stage = "public-job";
    const job = await resolveCvJob(input.jobKey);
    if (!job || job.sample)
      return reply(
        { error: "Selecciona una convocatoria real del portal." },
        404,
      );
    if (!job.requirements.length)
      return reply(
        {
          error:
            "Todavía no se han identificado los requisitos oficiales de este puesto. Consulta sus bases antes de pedir orientación.",
        },
        422,
      );
    const configured = Number(process.env.GEMINI_DAILY_LIMIT || 20);
    const max = Number.isFinite(configured)
      ? Math.min(50, Math.max(1, Math.floor(configured)))
      : 20;
    stage = "shared-limit";
    // A shared durable bucket bounds usage across Vercel instances and visitors.
    if (
      !(await rateLimit(
        new Request("https://convoca-peru.invalid"),
        "cv-global",
        max,
        86400,
      ))
    )
      return reply(
        {
          error:
            "Se alcanzó el límite diario de consejos. El análisis local continúa disponible.",
        },
        429,
      );
    stage = "provider";
    try {
      return reply({ advice: await publicJobAdvice(job) });
    } catch (error) {
      if (!transientCoachError(error)) throw error;
      // Every provider attempt, including the single retry, consumes shared quota.
      stage = "retry-limit";
      if (
        !(await rateLimit(
          new Request("https://convoca-peru.invalid"),
          "cv-global",
          max,
          86400,
        ))
      )
        return reply(
          {
            error:
              "Se alcanzó el límite diario de consejos. El análisis local continúa disponible.",
          },
          429,
        );
      await new Promise((resolve) => setTimeout(resolve, 400));
      stage = "provider-retry";
      return reply({ advice: await publicJobAdvice(job) });
    }
  } catch (error) {
    // Operational metadata only: never log provider messages, prompts, keys or CV text.
    console.error("CV coaching unavailable", {
      stage,
      type: error instanceof Error ? error.name : "unknown",
      status:
        error &&
        typeof error === "object" &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : undefined,
    });
    return reply(
      {
        error:
          "Gemini no está disponible o no tiene cuota en este momento. Puedes seguir analizando y organizando tu CV en tu navegador.",
      },
      503,
    );
  }
}
