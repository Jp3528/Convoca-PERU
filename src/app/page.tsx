import Image from "next/image";
import Link from "next/link";
import { SearchPanel } from "@/components/SearchPanel";
import { DiscoveryCard } from "@/components/DiscoveryCard";
import { OpportunityCard } from "@/components/OpportunityCard";
import { ArticleCard } from "@/components/ArticleCard";
import { Advertisement } from "@/components/Advertisement";
import { Icon, type IconName } from "@/components/Icon";
import { getCatalog, getDiscoveries } from "@/lib/portal-store";
import { filterOpportunities } from "@/lib/search";
import { excludeReviewedDiscoveries } from "@/lib/discoveries";
import { formatDate } from "@/lib/data";
import { importSources } from "@/lib/import-types";

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
    text: "Mientras construyes tu carrera",
    icon: "graduate",
  },
  {
    name: "Prácticas profesionales",
    type: "Profesional",
    text: "Tu formación, puesta en práctica",
    icon: "briefcase",
  },
  {
    name: "Convocatorias CAS",
    type: "CAS",
    text: "Tu experiencia en el sector público",
    icon: "building",
  },
  {
    name: "Empleos",
    type: "Empleo",
    text: "Un nuevo reto profesional",
    icon: "arrow",
  },
];
export default async function Home() {
  const [{ opportunities, articles, demo }, found] = await Promise.all([
    getCatalog(),
    getDiscoveries(),
  ]);
  const discoveries = excludeReviewedDiscoveries(found, opportunities);
  const recent = filterOpportunities(opportunities, {}).slice(0, 6);
  const spotlight = discoveries[0];
  return (
    <main id="contenido" className="home-page">
      <section className="hero editorial-hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span />
              UNA NUEVA ETAPA EMPIEZA CON UNA DECISIÓN
            </p>
            <h1>
              El siguiente paso.
              <br />
              <span>Lo eliges tú.</span>
            </h1>
            <p className="hero-description">
              Prácticas, empleos y convocatorias públicas. Encuentra los
              requisitos, el sueldo y las fechas que necesitas para decidir
              dónde postular.
            </p>
            <div className="hero-actions">
              <Link
                className="button-primary button-accent"
                href="/convocatorias"
              >
                Explorar convocatorias <Icon name="arrow" size={20} />
              </Link>
              <Link className="hero-secondary-link" href="/asistente-cv">
                Preparar mi CV <Icon name="arrow" size={17} />
              </Link>
            </div>
            <div className="hero-points">
              <span>
                <Icon name="check" size={16} />
                Acceso gratuito
              </span>
              <span>
                <Icon name="check" size={16} />
                Sin crear una cuenta
              </span>
            </div>
          </div>
          <div className="hero-visual editorial-visual">
            <div className="photo-corner-mark" aria-hidden="true">
              <Icon name="arrow" size={36} />
            </div>
            <div className="hero-photo">
              <Image
                src="/images/postulacion-profesional-v2.png"
                alt="Imagen ilustrativa de profesionales preparando una postulación y revisando un currículum"
                width={1536}
                height={1024}
                priority
                sizes="(max-width: 760px) 95vw, 44vw"
              />
            </div>
            <div className="photo-caption">
              <span>EL TALENTO TAMBIÉN SE PREPARA</span>
              <Link href="/asistente-cv">
                Dale dirección a tu experiencia <Icon name="arrow" size={17} />
              </Link>
            </div>
            {spotlight && (
              <Link
                className="hero-opportunity-note"
                href={"/descubiertas/" + spotlight.id}
              >
                <span className="note-topline">
                  <span className="note-dot" />
                  EN EL RADAR · {spotlight.organization}
                </span>
                <strong>{spotlight.title}</strong>
                <span className="note-bottom">
                  {spotlight.details?.stipend ||
                    "Cierre: " + formatDate(spotlight.endsAt)}
                  <span className="note-arrow">
                    <Icon name="arrow" size={17} />
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>
        <div className="container hero-search">
          <div className="search-caption">
            <span>ENCUENTRA LO QUE VA CONTIGO</span>
            <span>Todo empieza por una buena búsqueda.</span>
          </div>
          <SearchPanel />
        </div>
      </section>

      <section className="container categories-section">
        <div className="category-intro">
          <p className="eyebrow">CADA TRAYECTORIA TIENE SU CAMINO</p>
          <h2>¿En qué etapa estás?</h2>
        </div>
        <div className="category-grid">
          {categories.map((c, i) => {
            const count =
              opportunities.filter((o) => o.type === c.type).length +
              discoveries.filter((d) => d.type === c.type).length;
            return (
              <Link
                key={c.type}
                href={"/convocatorias?tipo=" + c.type}
                className="category-card"
              >
                <div className="category-card-head">
                  <span className="category-icon">
                    <Icon name={c.icon} size={23} />
                  </span>
                  <span className="category-index">0{i + 1}</span>
                </div>
                <h3>{c.name}</h3>
                <p>{c.text}</p>
                <span className="category-bottom">
                  {count ? `${count} para explorar` : "Explorar esta categoría"}
                  <Icon name="arrow" size={18} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="radar-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow section-number">
                <span>01</span> CONVOCATORIAS EN FUENTES OFICIALES
              </p>
              <h2>En el radar de Convoca.</h2>
              <p>Información que vale la pena revisar. La decisión es tuya.</p>
            </div>
            <Link className="button-secondary" href="/descubiertas">
              Ver{" "}
              {discoveries.length === 1
                ? "la convocatoria"
                : discoveries.length
                  ? "las " + discoveries.length + " convocatorias"
                  : "todas las fuentes"}
              <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="radar-toolbar">
            <span>
              <span className="radar-status-dot" />
              {discoveries.length}{" "}
              {discoveries.length === 1
                ? "proceso con plazo pendiente"
                : "procesos con plazo pendiente"}
            </span>
            <div>
              <Link href="/convocatorias">Todas</Link>
              <Link href="/convocatorias?tipo=CAS">Sector público · CAS</Link>
              <Link href="/convocatorias?tipo=Empleo">Empleos</Link>
            </div>
          </div>
          {discoveries.length ? (
            <div
              className={
                "discovery-grid " +
                (discoveries.length === 1 ? "single-discovery-grid" : "")
              }
            >
              {discoveries.slice(0, 3).map((c) => (
                <DiscoveryCard key={c.id} discovery={c} />
              ))}
              {discoveries.length === 1 && (
                <aside className="discovery-context">
                  <p className="eyebrow">UNA POSTULACIÓN BIEN INFORMADA</p>
                  <h3>
                    Los detalles hacen
                    <br />
                    la diferencia.
                  </h3>
                  <p>
                    Antes de enviar tu CV, confirma que tu perfil cumple lo que
                    pide la entidad.
                  </p>
                  <ol>
                    <li>
                      <span>01</span>Revisa formación, experiencia y documentos.
                    </li>
                    <li>
                      <span>02</span>Anota las fechas y el canal de postulación.
                    </li>
                    <li>
                      <span>03</span>Contrasta siempre con las bases oficiales.
                    </li>
                  </ol>
                  <Link className="text-link" href="/asistente-cv">
                    Prepara tu CV para el puesto <Icon name="arrow" size={18} />
                  </Link>
                </aside>
              )}
            </div>
          ) : (
            <div className="radar-empty">
              <Icon name="search" size={28} />
              <h3>La búsqueda sigue en marcha.</h3>
              <p>
                No hay hallazgos recientes con plazo pendiente en las fuentes
                consultadas. Los próximos aparecerán aquí automáticamente.
              </p>
              <Link className="text-link" href="/blog">
                Mientras tanto, prepara tu postulación{" "}
                <Icon name="arrow" size={18} />
              </Link>
            </div>
          )}
          <div className="source-strip">
            <span>CONSULTAMOS FUENTES OFICIALES</span>
            {importSources.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.organization}
                <Icon name="external" size={14} />
              </a>
            ))}
            <small>Portal independiente. Verifica las bases.</small>
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="opportunities-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <p className="eyebrow">SELECCIÓN EDITORIAL</p>
                <h2>Explora tu próximo reto.</h2>
              </div>
              <Link className="text-link" href="/convocatorias">
                Ver catálogo <Icon name="arrow" size={18} />
              </Link>
            </div>
            {demo && (
              <p className="catalog-note">
                Esta vista incluye muestras identificadas. Consulta la vigencia
                en cada entidad.
              </p>
            )}
            <div className="opportunity-grid">
              {recent.map((o) => (
                <OpportunityCard key={o.slug} opportunity={o} compact />
              ))}
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

      <section className="container cv-studio-section">
        <div className="cv-studio">
          <div className="cv-studio-copy">
            <p className="eyebrow section-number">
              <span>02</span> TU PERFIL, CON DIRECCIÓN
            </p>
            <h2>
              Un CV preparado
              <br />
              para <em>ese puesto.</em>
            </h2>
            <p>
              Haz visible lo que sabes hacer. Compara tu experiencia con los
              requisitos y organiza un borrador que puedas seguir mejorando.
            </p>
            <ul>
              <li>
                <Icon name="check" size={17} />
                Palabras clave del perfil
              </li>
              <li>
                <Icon name="check" size={17} />
                Revisión de estructura
              </li>
              <li>
                <Icon name="check" size={17} />
                Borrador descargable
              </li>
            </ul>
            <Link className="button-primary button-cream" href="/asistente-cv">
              Abrir asistente de CV <Icon name="arrow" size={20} />
            </Link>
            <span className="cv-studio-privacy">
              <Icon name="check" size={15} />
              Tu CV se analiza en tu navegador.
            </span>
          </div>
          <div className="cv-studio-art" aria-hidden="true">
            <div className="cv-orbit" />
            <div className="cv-paper cv-paper-back" />
            <div className="cv-paper">
              <div className="cv-paper-heading">
                <span>MI PERFIL</span>
                <span>CV</span>
              </div>
              <div className="cv-paper-name">
                Tu experiencia.
                <br />
                Bien presentada.
              </div>
              <div className="cv-paper-line wide" />
              <div className="cv-paper-line" />
              <div className="cv-paper-section">
                <span>Experiencia</span>
                <Icon name="check" size={19} />
              </div>
              <div className="cv-paper-line wide" />
              <div className="cv-paper-line" />
              <div className="cv-paper-section">
                <span>Formación</span>
                <Icon name="check" size={19} />
              </div>
              <div className="cv-paper-line wide" />
              <div className="cv-paper-line" />
              <div className="cv-paper-footer">
                HECHO CON TU TRAYECTORIA REAL <Icon name="arrow" size={18} />
              </div>
            </div>
            <span className="cv-art-label">
              <Icon name="check" size={17} />
              Sin inventar información.
            </span>
          </div>
        </div>
      </section>

      <section className="container how-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">DE LA BÚSQUEDA A LA POSTULACIÓN</p>
            <h2>Tres pasos. Una decisión mejor preparada.</h2>
          </div>
        </div>
        <div className="steps-grid">
          {[
            {
              n: "01",
              title: "Encuentra tu oportunidad",
              text: "Filtra por carrera, región y tipo de convocatoria. Guarda las opciones que encajen contigo.",
              icon: "search",
            },
            {
              n: "02",
              title: "Conoce los detalles",
              text: "Revisa requisitos, funciones, remuneración, vacantes y fechas antes de preparar los documentos.",
              icon: "book",
            },
            {
              n: "03",
              title: "Postula en la entidad",
              text: "Consulta las bases y presenta tu postulación por el canal oficial. Conserva tu comprobante de envío.",
              icon: "external",
            },
          ].map((s) => (
            <article className="step-card" key={s.n}>
              <div>
                <span>{s.n}</span>
                <Icon name={s.icon as IconName} size={23} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="guides-wrap">
        <div className="container guides-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow section-number">
                <span>03</span> HERRAMIENTAS PARA TU SIGUIENTE PASO
              </p>
              <h2>Llega mejor preparado.</h2>
            </div>
            <Link className="text-link" href="/blog">
              Todas las guías <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div
            className={
              "article-grid " +
              (articles.length === 1 ? "single-article-grid" : "")
            }
          >
            {articles.slice(0, 3).map((a, i) => (
              <ArticleCard key={a.slug} article={a} index={i} />
            ))}
          </div>
        </div>
      </section>
      <section className="container">
        <div className="save-banner">
          <span className="banner-symbol">
            <Icon name="bookmark" size={28} />
          </span>
          <div>
            <h2>Las buenas opciones, siempre a mano.</h2>
            <p>Guárdalas y retoma tu búsqueda cuando quieras.</p>
          </div>
          <Link href="/guardados" className="button-secondary">
            Mis convocatorias guardadas <Icon name="arrow" size={18} />
          </Link>
        </div>
      </section>

      <section className="container faq-section">
        <div>
          <p className="eyebrow">SIN LETRA PEQUEÑA</p>
          <h2>Lo que necesitas saber.</h2>
          <p>Información clara, también sobre nosotros.</p>
          <Link className="text-link" href="/contacto">
            Hablar con el equipo <Icon name="arrow" size={17} />
          </Link>
        </div>
        <div className="faq-list">
          <details>
            <summary>¿Tengo que pagar para usar Convoca Perú?</summary>
            <p>
              No. Puedes explorar y guardar convocatorias y usar la revisión
              local de CV de forma gratuita, sin crear una cuenta.
            </p>
          </details>
          <details>
            <summary>¿Dónde presento mi postulación?</summary>
            <p>
              En la entidad que convoca. Abre la ficha, revisa las bases y
              utiliza el canal oficial indicado. Convoca Perú no recibe
              postulaciones.
            </p>
          </details>
          <details>
            <summary>¿Cómo se obtienen las convocatorias?</summary>
            <p>
              Consultamos listados oficiales automáticamente. Cada hallazgo
              identifica su fuente y requiere verificar las bases. Las fichas
              editoriales se revisan antes de publicarse.
              {demo &&
                " Esta vista local también incluye muestras identificadas."}
            </p>
          </details>
          <details>
            <summary>¿Qué ocurre con mi CV y mis guardados?</summary>
            <p>
              Tu CV se analiza en la memoria de la pestaña y se pierde al
              recargar. Las convocatorias guardadas sí permanecen en este
              navegador; no se sincronizan entre dispositivos.
            </p>
          </details>
        </div>
      </section>
    </main>
  );
}
