import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/data";
import { getCatalog } from "@/lib/portal-store";
import { Advertisement } from "@/components/Advertisement";
export const dynamic = "force-dynamic";
import { Icon } from "@/components/Icon";
import { ArticleCard } from "@/components/ArticleCard";
import { ShareButton } from "@/components/ShareButton";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articles } = await getCatalog();
  const slug = (await params).slug;
  const a = articles.find((item) => item.slug === slug);
  return a
    ? {
        title: a.title,
        description: a.description,
        robots: a.isSample ? { index: false, follow: true } : undefined,
      }
    : { title: "Guía no encontrada" };
}
export default async function Article({ params }: Props) {
  const { articles } = await getCatalog();
  const slug = (await params).slug;
  const a = articles.find((item) => item.slug === slug);
  if (!a) notFound();
  return (
    <main id="contenido" className="page-shell">
      <nav className="breadcrumbs" aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span>/</span>
        <Link href="/blog">Guías y consejos</Link>
        <span>/</span>
        <span aria-current="page">{a.category}</span>
      </nav>
      <div className="reading-layout">
        <article className="reading-card">
          {a.isSample && (
            <div className="catalog-note">
              Guía de muestra del catálogo local. El contenido editorial
              definitivo se gestiona desde el panel.
            </div>
          )}
          <header>
            <p className="eyebrow">{a.category}</p>
            <h1>{a.title}</h1>
            <p className="article-lead">{a.description}</p>
            <div className="reading-meta">
              <span className="editor-avatar">CP</span>
              <div>
                <strong>Guías Convoca Perú</strong>
                <span>
                  {formatDate(a.publishedAt)} · {a.readTime} de lectura
                </span>
              </div>
            </div>
          </header>
          <div className="article-body">
            {a.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <Advertisement placement="article" eligible={!a.isSample} />
          <div className="reading-bottom">
            <span>¿Te resultó útil? Comparte esta guía.</span>
            <ShareButton />
          </div>
        </article>
        <aside className="reading-aside">
          <Icon name="graduate" size={32} />
          <p className="eyebrow">DE LA PREPARACIÓN A LA ACCIÓN</p>
          <h2>Encuentra dónde dar tu siguiente paso.</h2>
          <p>
            Explora las convocatorias y revisa qué requisitos se ajustan a tu
            perfil.
          </p>
          <Link className="button-primary" href="/convocatorias">
            Ver oportunidades <Icon name="arrow" size={17} />
          </Link>
          <div className="reading-note">
            Contenido orientativo. En procesos públicos, consulta siempre las
            bases y las indicaciones de la entidad.
          </div>
        </aside>
      </div>
      <section className="related-section">
        <div className="section-heading">
          <h2>Sigue preparándote.</h2>
          <Link className="text-link" href="/blog">
            Todas las guías <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="article-grid">
          {articles
            .filter((x) => x.slug !== a.slug)
            .slice(0, 3)
            .map((article, index) => (
              <ArticleCard key={article.slug} article={article} index={index} />
            ))}
        </div>
      </section>
    </main>
  );
}
