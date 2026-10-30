import Link from "next/link";
import type { Metadata } from "next";
import { getDiscoveries } from "@/lib/portal-store";
import { filterDiscoveries } from "@/lib/discoveries";
import { importSources } from "@/lib/import-types";
import { DiscoveryCard } from "@/components/DiscoveryCard";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Convocatorias encontradas automáticamente",
  description:
    "Hallazgos recientes en fuentes oficiales, con fechas y enlaces para verificar las bases de cada convocatoria.",
  robots: { index: false, follow: true },
};
export default async function Discoveries({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const first = (key: string) =>
    (Array.isArray(params[key]) ? params[key][0] : params[key])
      ?.trim()
      .slice(0, 160) || "";
  const q = first("q"),
    source = first("fuente");
  const discoveries = await getDiscoveries(),
    filtered = filterDiscoveries(discoveries, q, source);
  return (
    <main id="contenido">
      <section className="listing-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span>/</span>
            <span aria-current="page">Búsqueda automática</span>
          </nav>
          <p className="eyebrow">
            LAS FUENTES SE ACTUALIZAN. EL PORTAL TAMBIÉN.
          </p>
          <h1>Convocatorias encontradas para ti.</h1>
          <p>
            El servidor consulta fuentes oficiales periódicamente y muestra los
            hallazgos con plazo pendiente. Revisa siempre las bases: estos datos
            no han pasado por una revisión editorial.
          </p>
          <form
            key={JSON.stringify([q, source])}
            className="discovery-search admin-form"
            action="/descubiertas"
            method="get"
          >
            <label>
              Busca un puesto, entidad o lugar
              <input
                name="q"
                defaultValue={q}
                maxLength={160}
                placeholder="Por ejemplo: analista, Lima…"
                type="search"
              />
            </label>
            <label>
              Fuente oficial
              <select name="fuente" defaultValue={source}>
                <option value="">Todas las fuentes</option>
                {importSources.map((s) => (
                  <option value={s.id} key={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button-primary" type="submit">
              Buscar hallazgos
            </button>
          </form>
        </div>
      </section>
      <section className="container discoveries-section">
        <div className="section-heading">
          <p>
            <strong>{filtered.length}</strong> hallazgos con cierre pendiente
          </p>
          <Link className="text-link" href="/convocatorias">
            Ver fichas editoriales →
          </Link>
        </div>
        {filtered.length ? (
          <div className="discovery-grid">
            {filtered.map((c) => (
              <DiscoveryCard
                key={c.sourceId + c.sourceUrl + c.reference}
                discovery={c}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>
              {discoveries.length
                ? "No hay coincidencias para esta búsqueda."
                : "La próxima búsqueda puede traer nuevas oportunidades."}
            </h2>
            <p>
              {discoveries.length
                ? "Prueba otro puesto o consulta todas las fuentes."
                : "Los procesos vencidos, retirados del listado o sin consulta reciente no aparecen aquí. La búsqueda continúa desde el servidor."}
            </p>
            <Link className="button-secondary" href="/descubiertas">
              Ver todos los hallazgos
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
