import type { Metadata } from "next";
import { getCatalog, getDiscoveries } from "@/lib/portal-store";
import { discoveryKey } from "@/lib/discoveries";
import { SavedTracker } from "@/components/SavedTracker";
import type { SavedJob } from "@/lib/saved-applications";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mis convocatorias guardadas" };
export default async function SavedPage() {
  const [{ opportunities }, discoveries] = await Promise.all([
    getCatalog(),
    getDiscoveries(),
  ]);
  const catalog: SavedJob[] = [
    ...opportunities.map(
      ({ slug, title, organization, endsAt, startsAt, isSample }) => ({
        key: slug,
        title,
        organization,
        endsAt,
        startsAt,
        sample: isSample,
        href: `/convocatorias/${slug}`,
      }),
    ),
    ...discoveries.map(
      ({ id, title, organization, endsAt, startsAt, availability }) => ({
        key: discoveryKey({ id }),
        title,
        organization,
        endsAt,
        startsAt,
        availability,
        href: `/descubiertas/${id}`,
      }),
    ),
  ];
  return (
    <main id="contenido" className="page-shell saved-page">
      <header className="page-header">
        <h1>Mis convocatorias guardadas</h1>
        <p>
          Revisa qué convocatorias cierran pronto y registra las postulaciones
          que ya enviaste. Tu seguimiento se guarda en este navegador.
        </p>
      </header>
      <SavedTracker catalog={catalog} />
    </main>
  );
}
