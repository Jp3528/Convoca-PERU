import type { Metadata } from "next";
import { currentEditor, authConfigured } from "@/lib/editor-auth";
import { getRecords, storageProvider } from "@/lib/portal-store";
import { publisherId, indexable, adsEnabled } from "@/lib/portal-config";
import { EditorLogin } from "@/components/EditorLogin";
import { EditorDashboard } from "@/components/EditorDashboard";
import { automationStatus } from "@/lib/import-automation";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Panel editorial",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  const email = await currentEditor();
  if (!email)
    return (
      <main id="contenido" className="page-shell">
        <EditorLogin configured={authConfigured()} />
      </main>
    );
  const records = await getRecords();
  const real = records.filter(
    (r) => r.status === "published" && !r.sample && r.verified,
  );
  const domain = process.env.NEXT_PUBLIC_SITE_URL || "";
  const readiness = [
    {
      label: "Base de datos para Vercel",
      ready: storageProvider() === "supabase",
      detail:
        storageProvider() === "supabase"
          ? "Conexión Supabase configurada."
          : "La versión local guarda en el servidor. Conecta Supabase antes de publicar en Vercel.",
    },
    {
      label: "Convocatorias revisadas",
      ready: real.some((r) => r.kind === "opportunity"),
      detail:
        "Publica oportunidades reales con bases, fechas y un resumen propio. Las muestras no cuentan.",
    },
    {
      label: "Guías originales",
      ready: real.some((r) => r.kind === "article"),
      detail:
        "Desarrolla contenido útil para postulantes y revísalo antes de publicarlo.",
    },
    {
      label: "Dirección pública e indexación",
      ready:
        domain.startsWith("https://") &&
        !domain.includes("localhost") &&
        indexable(),
      detail:
        "Configura el dominio definitivo y activa SITE_INDEXABLE cuando el contenido real esté listo.",
    },
    {
      label: "Cuenta de AdSense",
      ready: !!publisherId(),
      detail:
        "Registra tu cuenta y añade el identificador ca-pub y los identificadores de tus bloques.",
    },
    {
      label: "Privacidad y consentimiento publicitario",
      ready: process.env.NEXT_PUBLIC_ADSENSE_CONSENT_READY === "true",
      detail:
        "Revisa la privacidad y configura los mensajes de consentimiento de Google o una CMP certificada donde corresponda.",
    },
    {
      label: "Anuncios habilitados",
      ready: adsEnabled(),
      detail:
        "Los anuncios están desactivados hasta completar la cuenta, el consentimiento y la configuración. La aprobación depende de Google.",
    },
  ];
  return (
    <main id="contenido" className="page-shell">
      <EditorDashboard
        initialRecords={records}
        email={email}
        provider={storageProvider()}
        readiness={readiness}
        automation={await automationStatus()}
      />
    </main>
  );
}
