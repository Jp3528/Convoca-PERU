import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { getCatalog } from "@/lib/portal-store";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Guías y consejos para postular" };
export default async function Guides() {
  const { articles } = await getCatalog();
  return (
    <main id="contenido" className="page-shell">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <span aria-current="page">Guías y consejos</span>
      </nav>
      <header className="page-header">
        <p className="eyebrow">PREPÁRATE PARA LO QUE VIENE</p>
        <h1>Tu talento merece una buena preparación.</h1>
        <p>
          Desde tu primer CV hasta la entrevista: ideas claras y herramientas
          para avanzar con más confianza.
        </p>
      </header>
      <section className="article-grid" aria-label="Guías para postular">
        {articles.map((a, index) => (
          <ArticleCard key={a.slug} article={a} index={index} />
        ))}
      </section>
    </main>
  );
}
