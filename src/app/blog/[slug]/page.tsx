import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, formatDate, getArticleBySlug } from "@/lib/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Articulo no encontrado",
    };
  }

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="page-shell">
      <nav className="mini-nav" aria-label="Secciones">
        <Link href="/">Inicio</Link>
        <Link href="/blog">Guias</Link>
        <Link href="/convocatorias">Convocatorias</Link>
      </nav>

      <article className="detail-card">
        <p className="eyebrow">{article.category}</p>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <div className="detail-meta">
          <span className="filter-chip">{article.readTime}</span>
          <span className="filter-chip">{formatDate(article.publishedAt)}</span>
        </div>
        {article.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
    </main>
  );
}
