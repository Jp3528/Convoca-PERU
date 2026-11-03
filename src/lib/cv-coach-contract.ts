export type JobAdvice = {
  overview: string;
  keywords: string[];
  priorities: string[];
  checklist: string[];
  questions: string[];
};
export function coachRequest(value: unknown): { jobKey: string; adult: true } {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Solicitud inválida.");
  const v = value as Record<string, unknown>;
  if (
    Object.keys(v).some((k) => !["jobKey", "adult"].includes(k)) ||
    v.adult !== true ||
    typeof v.jobKey !== "string" ||
    !/^[a-z0-9][a-z0-9-]{0,159}$/.test(v.jobKey)
  )
    throw new Error(
      "El servicio solo admite una convocatoria y la confirmación de mayoría de edad.",
    );
  return { jobKey: v.jobKey, adult: true };
}
export const adviceSchema = {
  type: "object",
  additionalProperties: false,
  required: ["overview", "keywords", "priorities", "checklist", "questions"],
  properties: {
    overview: { type: "string" },
    keywords: { type: "array", items: { type: "string" }, maxItems: 10 },
    priorities: { type: "array", items: { type: "string" }, maxItems: 5 },
    checklist: { type: "array", items: { type: "string" }, maxItems: 5 },
    questions: { type: "array", items: { type: "string" }, maxItems: 3 },
  },
};
export function validateAdvice(value: unknown): JobAdvice {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Respuesta inválida.");
  const v = value as Record<string, unknown>;
  if (
    Object.keys(v).some(
      (k) =>
        ![
          "overview",
          "keywords",
          "priorities",
          "checklist",
          "questions",
        ].includes(k),
    )
  )
    throw new Error("Respuesta inválida.");
  const clean = (x: unknown, max: number) => {
    if (
      typeof x !== "string" ||
      !x.trim() ||
      x.length > max ||
      /[<>\u0000-\u0008]/.test(x)
    )
      throw new Error("Respuesta inválida.");
    return x.trim();
  };
  const list = (k: string, max: number) => {
    const a = v[k];
    if (!Array.isArray(a) || a.length < 1 || a.length > max)
      throw new Error("Respuesta inválida.");
    return a.map((x) => clean(x, 600));
  };
  return {
    overview: clean(v.overview, 1200),
    keywords: list("keywords", 10).map((x) => clean(x, 80)),
    priorities: list("priorities", 5),
    checklist: list("checklist", 5),
    questions: list("questions", 3),
  };
}
