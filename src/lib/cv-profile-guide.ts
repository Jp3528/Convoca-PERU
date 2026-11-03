import { jobKeywords, type CvJob } from "./cv-analysis";
import type { JobAdvice } from "./cv-coach-contract";

// A transparent, local alternative. It quotes public requirements and never reads a CV.
export function profileGuide(job: CvJob): JobAdvice {
  const keywords = jobKeywords(job).slice(0, 10);
  return {
    overview: `Para preparar tu postulación a ${job.title.slice(0, 220)} en ${job.organization.slice(0, 160)}, relaciona cada requisito publicado con evidencias de tu trayectoria real. Esta guía no comprueba que cumplas el perfil.`,
    keywords: keywords.length ? keywords : [job.title.slice(0, 80)],
    priorities: job.requirements.length
      ? job.requirements
          .slice(0, 5)
          .map((text) => (text.length > 560 ? text.slice(0, 559) + "…" : text))
      : [
          "Consulta el perfil oficial para identificar los requisitos antes de adaptar el CV.",
        ],
    checklist: [
      "Comprueba formación, experiencia y documentos en las bases vigentes.",
      "Identifica una evidencia real para cada requisito que sí cumples.",
      "Conserva tus cargos, empleadores, fechas y nivel de estudios reales.",
      "Respeta el formato, los anexos, las fechas y el canal que indique la entidad.",
    ],
    questions: [
      "¿Qué experiencia concreta puedes acreditar para este puesto?",
      "¿Qué herramientas, responsabilidades o resultados reales conviene explicar mejor?",
      "¿Qué requisito necesitas confirmar en las bases antes de postular?",
    ],
  };
}
