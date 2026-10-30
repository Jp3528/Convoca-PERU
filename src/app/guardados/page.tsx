import type { Metadata } from "next";
import { getCatalog } from "@/lib/portal-store";
export const dynamic = "force-dynamic";
import { SavedList } from "@/components/SavedOpportunities";
export const metadata: Metadata = { title: "Mis convocatorias guardadas" };
export default async function SavedPage() {
  const { opportunities } = await getCatalog();
  return (
    <main id="contenido" className="page-shell saved-page">
      <header className="page-header">
        <p className="eyebrow">TU SELECCIÓN PERSONAL</p>
        <h1>Oportunidades que van contigo.</h1>
        <p>
          Vuelve a tus favoritas, revisa los detalles y prepara tu siguiente
          paso. Se guardan solo en este navegador.
        </p>
      </header>
      <SavedList opportunities={opportunities} />
    </main>
  );
}
