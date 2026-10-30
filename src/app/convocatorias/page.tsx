import type { Metadata } from "next";
import Link from "next/link";
import { OpportunityCard } from "@/components/OpportunityCard";
import { SearchPanel } from "@/components/SearchPanel";
import { Icon } from "@/components/Icon";
import { FilterSidebar } from "@/components/FilterSidebar";
import { getCatalog } from "@/lib/portal-store";
import { filterOpportunities, display, type Filters } from "@/lib/search";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Explorar convocatorias",
  description:
    "Filtra convocatorias por carrera, región, modalidad y tipo de oportunidad en Perú.",
};
type Search = Record<string, string | string[] | undefined>;
export default async function Listings({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const { opportunities, demo } = await getCatalog();
  const first = (key: string) => {
    const v = params[key];
    return (Array.isArray(v) ? v[0] : v)?.trim() || "";
  };
  const filters: Filters = {
    q: first("q"),
    departamento: first("departamento"),
    tipo: first("tipo"),
    sector: first("sector"),
    modalidad: first("modalidad"),
    estado: first("estado"),
    orden: first("orden"),
  };
  const filtered = filterOpportunities(opportunities, filters);
  function url(changes: Partial<Filters>) {
    const next = { ...filters, ...changes };
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) query.set(k, v);
    return "/convocatorias?" + query.toString();
  }
  const active = Object.entries(filters).filter(([k, v]) => v && k !== "orden");
  return (
    <main id="contenido">
      <section className="listing-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span>/</span>
            <span aria-current="page">Convocatorias</span>
          </nav>
          <p className="eyebrow">EL PRÓXIMO PASO LO ELIGES TÚ</p>
          <h1>Encuentra una oportunidad a tu medida.</h1>
          <p>
            Prácticas, empleos y convocatorias CAS. Explora, compara y guarda
            tus favoritas.
          </p>
          <SearchPanel
            key={JSON.stringify(filters)}
            compact
            defaults={filters}
          />
          <p className="discovery-list-link">
            <Link className="text-link" href="/descubiertas">
              Ver también los hallazgos de la búsqueda automática →
            </Link>
          </p>
        </div>
      </section>
      <section className="container listing-layout">
        <FilterSidebar>
          <form
            key={JSON.stringify(filters)}
            action="/convocatorias"
            method="get"
            className="filter-form"
          >
            {(["q", "departamento", "tipo", "orden"] as const).map((k) =>
              filters[k] ? (
                <input type="hidden" key={k} name={k} value={filters[k]} />
              ) : null,
            )}
            <fieldset>
              <legend>Estado de la convocatoria</legend>
              {[
                ["", "Todas"],
                ["vigentes", "Con fecha vigente"],
                ["finalizadas", "Finalizadas"],
              ].map(([value, label]) => (
                <label className="radio-label" key={value}>
                  <input
                    type="radio"
                    name="estado"
                    value={value}
                    defaultChecked={filters.estado === value}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Sector</legend>
              {[
                ["", "Todos los sectores"],
                ["Publico", "Sector público"],
                ["Privado", "Sector privado"],
              ].map(([value, label]) => (
                <label className="radio-label" key={value}>
                  <input
                    type="radio"
                    name="sector"
                    value={value}
                    defaultChecked={filters.sector === value}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Modalidad</legend>
              {[
                ["", "Todas las modalidades"],
                ["Presencial", "Presencial"],
                ["Hibrido", "Híbrido"],
                ["Remoto", "Remoto"],
              ].map(([value, label]) => (
                <label className="radio-label" key={value}>
                  <input
                    type="radio"
                    name="modalidad"
                    value={value}
                    defaultChecked={filters.modalidad === value}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </fieldset>
            <button className="button-primary" type="submit">
              Aplicar filtros <Icon name="arrow" size={17} />
            </button>
          </form>
          <div className="sidebar-tip">
            <Icon name="bookmark" size={23} />
            <h3>Haz tu propia selección</h3>
            <p>Guarda las que te interesan y revísalas en un solo lugar.</p>
            <Link className="text-link" href="/guardados">
              Mis guardados <Icon name="arrow" size={16} />
            </Link>
          </div>
        </FilterSidebar>
        <div className="listing-results">
          <div className="results-toolbar">
            <p>
              <strong>{filtered.length}</strong>{" "}
              {filtered.length === 1
                ? "oportunidad encontrada"
                : "oportunidades encontradas"}
            </p>
            <form
              key={JSON.stringify(filters)}
              className="sort-form"
              action="/convocatorias"
              method="get"
            >
              {Object.entries(filters).map(([k, v]) =>
                k !== "orden" && v ? (
                  <input key={k} type="hidden" name={k} value={v} />
                ) : null,
              )}
              <label className="sr-only" htmlFor="order">
                Orden de resultados
              </label>
              <select
                id="order"
                name="orden"
                defaultValue={filters.orden || ""}
              >
                <option value="">Más recientes y vigentes</option>
                <option value="cierre">Fecha de cierre</option>
                <option value="vacantes">Mayor número de vacantes</option>
              </select>
              <button type="submit" className="sort-button">
                Ordenar
              </button>
            </form>
          </div>
          {active.length > 0 && (
            <div className="active-filters" aria-label="Filtros aplicados">
              {active.map(([key, value]) => (
                <Link
                  key={key}
                  href={url({ [key]: "" })}
                  aria-label={"Quitar filtro " + value}
                >
                  {display(value || "")}
                  <Icon name="close" size={13} />
                </Link>
              ))}
            </div>
          )}
          {demo && (
            <div className="catalog-note">
              <span className="sample-dot" />
              <p>
                Datos de muestra. Las fechas indican el estado del ejemplo;
                confirma la disponibilidad con la entidad.
              </p>
            </div>
          )}
          {filtered.length > 0 ? (
            <div className="listing-stack">
              {filtered.map((o) => (
                <OpportunityCard key={o.slug} opportunity={o} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon name="search" size={32} />
              </span>
              <h2>Aún no hay coincidencias.</h2>
              <p>
                Prueba con una palabra más corta o amplía la región, el tipo de
                oportunidad o la modalidad.
              </p>
              <Link className="button-primary" href="/convocatorias">
                Ver todas las convocatorias <Icon name="arrow" size={17} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
