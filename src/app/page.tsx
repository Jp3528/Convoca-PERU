import Image from "next/image";
import Link from "next/link";
import { OpportunityCard } from "@/components/OpportunityCard";
import { SearchPanel } from "@/components/SearchPanel";
import { articles, opportunities } from "@/lib/data";

export const revalidate = 3600;

export default function Home() {
  const featured = opportunities.filter((item) => item.featured);
  const publicCount = opportunities.filter((item) => item.sector === "Publico").length;
  const privateCount = opportunities.filter((item) => item.sector === "Privado").length;
  const qualityChecks = [
    "Fuente oficial obligatoria",
    "Fechas y carreras normalizadas",
    "Revision humana antes de publicar",
    "Contenido listo para SEO",
  ];

  return (
    <main>
      <section className="hero">
        <nav className="top-nav" aria-label="Principal">
          <Link className="brand" href="/">
            <span>CP</span>
            <strong>Convoca Peru</strong>
          </Link>
          <div>
            <Link href="/convocatorias">Convocatorias</Link>
            <Link href="/blog">Guias</Link>
            <Link href="/admin">Publicar</Link>
            <Link href="/contacto">Contacto</Link>
          </div>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Practicas, empleos y CAS en Peru</p>
            <h1>Encuentra convocatorias laborales sin perderte entre PDFs.</h1>
            <p>
              Convoca Peru organiza oportunidades verificadas por carrera,
              region, modalidad y fecha de cierre. La experiencia esta pensada
              para postulantes y para un flujo editorial serio.
            </p>
            <div className="hero-actions">
              <Link className="button-primary" href="/convocatorias">
                Ver convocatorias
              </Link>
              <Link className="button-secondary" href="/blog">
                Leer guias para postular
              </Link>
            </div>
            <div className="trust-row" aria-label="Controles de confianza">
              {qualityChecks.slice(0, 3).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <aside className="hero-visual" aria-label="Tablero editorial del portal">
            <Image
              src="/images/convoca-dashboard-hero.png"
              alt="Tablero editorial de convocatorias con tarjetas verificadas, mapa y calendario"
              width={1600}
              height={900}
              priority
            />
            <div className="hero-panel">
              <div>
                <span>{opportunities.length}</span>
                <p>convocatorias iniciales</p>
              </div>
              <div>
                <span>{publicCount}</span>
                <p>sector publico</p>
              </div>
              <div>
                <span>{privateCount}</span>
                <p>sector privado</p>
              </div>
            </div>
          </aside>
        </div>

        <SearchPanel />
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Destacadas</p>
          <h2>Convocatorias recientes</h2>
          <Link className="text-link" href="/convocatorias">
            Ver todas
          </Link>
        </div>
        <div className="opportunity-grid">
          {featured.map((opportunity) => (
            <OpportunityCard key={opportunity.slug} opportunity={opportunity} />
          ))}
        </div>
      </section>

      <section className="section band">
        <div className="quality-dashboard">
          <article className="quality-copy">
            <p className="eyebrow">Control de calidad editorial</p>
            <h2>Publicar rapido no sirve si la convocatoria no es confiable.</h2>
            <p>
              La subida debe pasar por una cola de revision: fuente oficial,
              fecha vigente, carreras bien escritas, resumen claro y enlace de
              postulacion real.
            </p>
          </article>
          <div className="quality-list">
            {qualityChecks.map((item, index) => (
              <article key={item}>
                <span>0{index + 1}</span>
                <h3>{item}</h3>
                <p>
                  {index === 0
                    ? "Cada publicacion debe mostrar de donde sale la informacion."
                    : index === 1
                      ? "Los filtros funcionan mejor cuando los datos tienen el mismo formato."
                      : index === 2
                        ? "Evita publicar enlaces vencidos, duplicados o poco claros."
                        : "Convocatorias mas guias crean contenido util para Google."}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Guias</p>
          <h2>Contenido para atraer trafico organico</h2>
          <Link className="text-link" href="/blog">
            Ver blog
          </Link>
        </div>
        <div className="article-grid">
          {articles.map((article) => (
            <Link className="article-card" href={`/blog/${article.slug}`} key={article.slug}>
              <span>{article.category}</span>
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <small>{article.readTime}</small>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
