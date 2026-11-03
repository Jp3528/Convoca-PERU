import type { Metadata } from "next";
import Link from "next/link";
import { CvAssistant } from "@/components/CvAssistant";
import { Icon } from "@/components/Icon";
import { cvJobOptions, resolveCvJob } from "@/lib/cv-jobs";
import { coachEnabled } from "@/lib/cv-coach";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Asistente de CV y revisión orientativa ATS",
  description:
    "Revisa tu CV en tu navegador, compáralo con los requisitos de una convocatoria y organiza un borrador sin inventar información.",
  robots: { index: false, follow: true },
};
export default async function CvPage({
  searchParams,
}: {
  searchParams: Promise<{ convocatoria?: string }>;
}) {
  const { convocatoria } = await searchParams;
  const key =
    typeof convocatoria === "string" && /^[a-z0-9-]{1,160}$/.test(convocatoria)
      ? convocatoria
      : undefined;
  const jobs = await cvJobOptions();
  if (key && !jobs.some((j) => j.key === key)) {
    const extra = await resolveCvJob(key);
    if (extra) jobs.unshift(extra);
  }
  return (
    <main id="contenido">
      <section className="cv-page-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span>/</span>
            <span aria-current="page">Asistente de CV</span>
          </nav>
          <p className="eyebrow">PREPARA UNA POSTULACIÓN CON SENTIDO</p>
          <h1>Haz que tu experiencia se entienda mejor.</h1>
          <p>
            Compara tu CV con el puesto, identifica qué información necesitas
            aclarar y organiza un borrador con tu trayectoria real.
          </p>
          <div className="cv-privacy-line">
            <Icon name="check" size={18} />
            Tu CV se analiza en tu dispositivo. Sin cuenta y sin guardar
            documentos.
          </div>
        </div>
      </section>
      <CvAssistant jobs={jobs} initialKey={key} aiEnabled={coachEnabled()} />
    </main>
  );
}
