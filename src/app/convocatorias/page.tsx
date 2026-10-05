import type { Metadata } from "next";
import Link from "next/link";
import { OpportunityCard } from "@/components/OpportunityCard";
import { SearchPanel } from "@/components/SearchPanel";
import { departments, opportunities } from "@/lib/data";

type Search = Record<string, string | string[] | undefined>;

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Convocatorias laborales y practicas",
  description:
    "Busca convocatorias por carrera, departamento, modalidad y tipo de oportunidad en Peru.",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ConvocatoriasPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const q = (firstValue(params.q) ?? "").trim().toLowerCase();
  const department = firstValue(params.departamento) ?? "";
  const type = firstValue(params.tipo) ?? "";

  const filtered = opportunities.filter((opportunity) => {
    const haystack = [
      opportunity.title,
      opportunity.organization,
      opportunity.summary,
      opportunity.department,
      opportunity.province ?? "",
      ...opportunity.careers,
    ]
      .join(" ")
      .toLowerCase();

    const matchesQuery = q ? haystack.includes(q) : true;
    const matchesDepartment = department
      ? opportunity.department === department
      : true;
    const matchesType = type ? opportunity.type === type : true;

    return matchesQuery && matchesDepartment && matchesType;
  });

  return (
    <main className="page-shell">
      <nav className="mini-nav" aria-label="Secciones">
        <Link href="/">Inicio</Link>
        <Link href="/blog">Guias</Link>
        <Link href="/admin">Publicar</Link>
      </nav>

      <header className="page-header">
        <p className="eyebrow">Bolsa de oportunidades</p>
        <h1>Convocatorias para postular hoy.</h1>
        <p>
          Filtra oportunidades por carrera, departamento y tipo. Esta primera
          version usa datos revisados de muestra; la estructura ya queda lista
          para conectarse a una base de datos.
        </p>
      </header>

      <SearchPanel
        compact
        defaults={{ q: firstValue(params.q), departamento: department, tipo: type }}
      />

      <section className="listing-layout section" aria-label="Resultados">
        <aside className="filter-card">
          <p className="eyebrow">Departamentos</p>
          <Link href="/convocatorias">Todos</Link>
          {departments.map((item) => (
            <Link
              key={item}
              href={`/convocatorias?departamento=${encodeURIComponent(item)}`}
            >
              {item}
            </Link>
          ))}
        </aside>

        <div className="listing-stack">
          <div className="section-heading">
            <p className="filter-chip">{filtered.length} resultados</p>
            {q || department || type ? (
              <Link className="text-link" href="/convocatorias">
                Limpiar filtros
              </Link>
            ) : null}
          </div>

          {filtered.length > 0 ? (
            filtered.map((opportunity) => (
              <OpportunityCard
                key={opportunity.slug}
                opportunity={opportunity}
              />
            ))
          ) : (
            <p className="empty-state">
              No hay convocatorias con esos filtros. Prueba con otra carrera,
              departamento o tipo de oportunidad.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
