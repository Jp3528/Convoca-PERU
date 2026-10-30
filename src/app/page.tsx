import Image from "next/image";
import Link from "next/link";
import { OpportunityCard } from "@/components/OpportunityCard";
import { SearchPanel } from "@/components/SearchPanel";
import { ArticleCard } from "@/components/ArticleCard";
import { Icon, type IconName } from "@/components/Icon";
import { getCatalog, getDiscoveries } from "@/lib/portal-store";
import { DiscoveryCard } from "@/components/DiscoveryCard";
import { Advertisement } from "@/components/Advertisement";
import { filterOpportunities } from "@/lib/search";
import { excludeReviewedDiscoveries } from "@/lib/discoveries";
export const dynamic = "force-dynamic";
const categories: {
  name: string;
  type: string;
  text: string;
  icon: IconName;
}[] = [
  {
    name: "Prácticas preprofesionales",
    type: "Preprofesional",
    text: "Tu primera experiencia empieza aquí",
    icon: "graduate",
  },
  {
    name: "Prácticas profesionales",
    type: "Profesional",
    text: "Da el siguiente paso como egresado",
    icon: "briefcase",
  },
  {
    name: "Convocatorias CAS",
    type: "CAS",
    text: "Construye tu camino en el sector público",
    icon: "building",
  },
  {
    name: "Empleos",
    type: "Empleo",
    text: "Nuevos retos para seguir creciendo",
    icon: "search",
  },
];
export default async function Home() {
  const [{ opportunities, articles, demo }, foundDiscoveries] =
    await Promise.all([getCatalog(), getDiscoveries()]);
  const discoveries = excludeReviewedDiscoveries(
    foundDiscoveries,
    opportunities,
  );
  const recent = filterOpportunities(opportunities, {}).slice(0, 6);
  const active = filterOpportunities(opportunities, {
    estado: "vigentes",
  }).length;
  return (
    <main id="contenido">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span /> TU TALENTO TIENE UN LUGAR
            </p>
            <h1>
              Tu próximo paso
              <br />
              empieza{" "}
              <span>
                aquí.
                <svg
                  viewBox="0 0 170 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8c45-8 101-8 164-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="hero-description">
              Encuentra prácticas, empleos y convocatorias CAS en todo el Perú.
              Menos búsquedas. Más oportunidades para ti.
            </p>
            <div className="hero-points">
              <span>
                <Icon name="check" size={16} /> Acceso gratuito
              </span>
              <span>
                <Icon name="check" size={16} /> Enlaces a las entidades
              </span>
              <span>
                <Icon name="check" size={16} /> Sin crear una cuenta
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-photo">
              <Image
                src="/images/equipo-profesional.jpg"
                alt="Profesionales jóvenes colaborando en una mesa de trabajo"
                width={1100}
                height={733}
                priority
                sizes="(max-width: 760px) 100vw, 45vw"
              />
            </div>
            <div className="hero-sticker">
              <span className="sticker-icon">
                <Icon name="briefcase" size={23} />
              </span>
              <div>
                <strong>Haz espacio para lo que viene.</strong>
                <span>Tu siguiente oportunidad te espera.</span>
              </div>
            </div>
            <span className="hero-spark spark-one" aria-hidden="true">
              ✳
            </span>
            <span className="hero-spark spark-two" aria-hidden="true">
              ✳
            </span>
          </div>
        </div>
        <div className="container hero-search">
          <SearchPanel />
        </div>
      </section>
      <section className="container categories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ELIGE TU CAMINO</p>
            <h2>Una oportunidad para cada etapa.</h2>
          </div>
          <Link className="text-link" href="/convocatorias">
            Explorar todas <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.map((c) => (
            <Link
              key={c.type}
              href={"/convocatorias?tipo=" + c.type}
              className="category-card"
            >
              <span className="category-icon">
                <Icon name={c.icon} size={24} />
              </span>
              <h3>{c.name}</h3>
              <p>{c.text}</p>
              <span className="category-bottom">
                {opportunities.filter((o) => o.type === c.type).length +
                  discoveries.filter((d) => d.type === c.type).length}{" "}
                para explorar <Icon name="arrow" size={18} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="container discoveries-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">BÚSQUEDA AUTOMÁTICA EN FUENTES OFICIALES</p>
            <h2>Nuevas oportunidades, sin buscarlas en cada portal.</h2>
            <p>
              Hallazgos con cierre pendiente. Verifica las bases antes de
              postular.
            </p>
          </div>
          <Link className="button-secondary" href="/descubiertas">
            Ver {discoveries.length || "todos los"} hallazgos →
          </Link>
        </div>
        {discoveries.length ? (
          <div className="discovery-grid">
            {discoveries.slice(0, 3).map((c) => (
              <DiscoveryCard
                key={c.sourceId + c.sourceUrl + c.reference}
                discovery={c}
              />
            ))}
          </div>
        ) : (
          <p className="catalog-note">
            El servidor revisa las fuentes periódicamente. Los próximos
            hallazgos vigentes aparecerán aquí automáticamente.
          </p>
        )}
      </section>
      {recent.length > 0 && (
        <section className="opportunities-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">ENCUENTRA TU SIGUIENTE RETO</p>
                <h2>Oportunidades para dar el salto.</h2>
                <p>Explora el catálogo y encuentra lo que encaja contigo.</p>
              </div>
              <Link className="button-secondary" href="/convocatorias">
                Ver todas las convocatorias <Icon name="arrow" size={18} />
              </Link>
            </div>
            {demo && (
              <div className="catalog-note">
                <span className="sample-dot" />
                <p>
                  <strong>Catálogo de demostración</strong> ·{" "}
                  {opportunities.length} convocatorias del catálogo, {active}{" "}
                  con fecha de cierre pendiente. Consulta la vigencia real en
                  cada entidad.
                </p>
              </div>
            )}
            <div className="opportunity-grid">
              {recent.map((o) => (
                <OpportunityCard key={o.slug} opportunity={o} compact />
              ))}
            </div>
            <div className="section-center">
              <Link className="button-primary" href="/convocatorias">
                Encontrar mi oportunidad <Icon name="arrow" size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}
      <div className="container">
        <Advertisement
          placement="home"
          eligible={opportunities.some((o) => !o.isSample)}
        />
      </div>
      <section className="container how-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MÁS CLARO. MÁS SIMPLE.</p>
            <h2>De la búsqueda a tu próximo paso.</h2>
          </div>
          <p className="section-intro">
            Toda la información que necesitas, organizada para que te concentres
            en postular.
          </p>
        </div>
        <div className="steps-grid">
          {[
            {
              n: "01",
              title: "Encuentra lo que va contigo",
              text: "Busca por carrera, región o tipo de oportunidad. Tú eliges por dónde empezar.",
              icon: "search",
            },
            {
              n: "02",
              title: "Revisa todos los detalles",
              text: "Compara requisitos, modalidad y fechas. Guarda las opciones que más te interesen.",
              icon: "bookmark",
            },
            {
              n: "03",
              title: "Postula en la fuente",
              text: "Accede al portal de la entidad para consultar las bases y completar tu postulación.",
              icon: "external",
            },
          ].map((step) => (
            <article className="step-card" key={step.n}>
              <div>
                <span>{step.n}</span>
                <Icon name={step.icon as IconName} size={23} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="container guides-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PREPÁRATE PARA LO QUE VIENE</p>
            <h2>Un buen comienzo se prepara.</h2>
            <p>Consejos prácticos para postular con más confianza.</p>
          </div>
          <Link className="text-link" href="/blog">
            Todas las guías <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="article-grid">
          {articles.slice(0, 3).map((a, index) => (
            <ArticleCard key={a.slug} article={a} index={index} />
          ))}
        </div>
      </section>
      <section className="container">
        <div className="save-banner">
          <span className="banner-symbol">
            <Icon name="bookmark" size={40} />
          </span>
          <div>
            <p className="eyebrow">TUS FAVORITAS, EN UN SOLO LUGAR</p>
            <h2>Que una buena oportunidad no se te pase.</h2>
            <p>
              Guarda convocatorias y vuelve a revisarlas cuando lo necesites.
              Sin registro.
            </p>
          </div>
          <Link href="/guardados" className="button-lime">
            Ver mis guardados <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>
      <section className="container faq-section">
        <div>
          <p className="eyebrow">RESOLVEMOS TUS DUDAS</p>
          <h2>Antes de dar el siguiente paso.</h2>
          <p>Lo que necesitas saber sobre Convoca Perú.</p>
          <Link className="text-link" href="/contacto">
            Ir a contacto <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="faq-list">
          <details>
            <summary>
              ¿Tengo que pagar para ver o guardar convocatorias?
            </summary>
            <p>
              No. Puedes explorar y guardar oportunidades de forma gratuita, sin
              crear una cuenta.
            </p>
          </details>
          <details>
            <summary>¿Cómo postulo a una convocatoria?</summary>
            <p>
              Abre la ficha, revisa los requisitos y usa el enlace al portal de
              la entidad. La postulación se realiza directamente allí.
            </p>
          </details>
          <details>
            <summary>¿Las convocatorias de esta versión son reales?</summary>
            <p>
              Los hallazgos automáticos proceden de listados oficiales y están
              identificados para que compruebes las bases. Las fichas
              editoriales requieren una revisión antes de publicarse. Confirma
              siempre los plazos y requisitos en la entidad.
              {demo &&
                " Esta vista local también incluye muestras identificadas."}
            </p>
          </details>
          <details>
            <summary>¿Dónde se guardan mis favoritas?</summary>
            <p>
              Se guardan en este navegador. No se sincronizan con otros
              dispositivos y se eliminan si borras los datos del sitio.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}
