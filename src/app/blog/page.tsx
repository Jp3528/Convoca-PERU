import type { Metadata } from "next";
import Link from "next/link";
import { articles } from "@/lib/data";

export const metadata: Metadata = {
  title: "Guias para postular",
  description:
    "Consejos para preparar CV, revisar convocatorias y postular a practicas o empleos en Peru.",
};

export default function BlogPage() {
  return (
    <main className="page-shell">
      <nav className="mini-nav" aria-label="Secciones">
        <Link href="/">Inicio</Link>
        <Link href="/convocatorias">Convocatorias</Link>
      </nav>

      <header className="page-header">
        <p className="eyebrow">Guias utiles</p>
        <h1>Contenido que tambien puede posicionar en Google.</h1>
        <p>
          El blog sostiene el trafico organico con articulos permanentes:
          curriculum, entrevistas, derechos de practicantes y seguridad al
          postular.
        </p>
      </header>

      <section className="article-grid" aria-label="Articulos">
        {articles.map((article) => (
          <Link
            className="article-card"
            href={`/blog/${article.slug}`}
            key={article.slug}
          >
            <span>{article.category}</span>
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <small>{article.readTime}</small>
          </Link>
        ))}
      </section>
    </main>
  );
}
