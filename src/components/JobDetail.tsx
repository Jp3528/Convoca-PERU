import Link from "next/link";
import type { JobView } from "@/lib/job-view";
import { formatDate } from "@/lib/data";
import { Icon } from "./Icon";
import { DeadlineBadge } from "./DeadlineBadge";
import { SaveButton } from "./SavedOpportunities";
import { ShareButton } from "./ShareButton";

export function JobDetail({ job: j }: { job: JobView }) {
  const inactive = ["closed", "stale", "removed"].includes(j.availability);
  return (
    <main id="contenido" className="job-detail-page">
      <section className="job-detail-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span>/</span>
            <Link href="/convocatorias">Convocatorias</Link>
            <span>/</span>
            <span aria-current="page">Detalle del puesto</span>
          </nav>
          <div className="job-detail-labels">
            <span className="type-tag">{j.type}</span>
            <span className={j.reviewed ? "review-badge" : "pending-badge"}>
              {j.sample
                ? "Muestra identificada"
                : j.reviewed
                  ? "Ficha editorial"
                  : "Extracción de fuente oficial"}
            </span>
            <DeadlineBadge
              endsAt={j.endsAt}
              startsAt={j.startsAt}
              availability={j.availability}
            />
          </div>
          <p className="job-detail-entity">
            <Icon name="building" size={18} />
            {j.organization}
            {j.reference && <span>· {j.reference}</span>}
          </p>
          <h1>{j.title}</h1>
          <p className="job-detail-summary">{j.summary}</p>
          <a className="text-link" href="#postular">
            Ver pasos para postular <Icon name="arrow" size={17} />
          </a>
          <div className="job-metric-grid">
            <div>
              <span>Remuneración o subvención</span>
              <strong>{j.stipend || "Por confirmar"}</strong>
              <small>
                {j.stipend
                  ? "Importe indicado en la fuente"
                  : "Consulta el perfil y las bases"}
              </small>
            </div>
            <div>
              <span>Vacantes</span>
              <strong>
                {j.vacancies
                  ? String(j.vacancies).padStart(2, "0")
                  : "Por confirmar"}
              </strong>
              <small>
                {j.vacancies === 1
                  ? "Puesto convocado"
                  : "Cantidad según perfil oficial"}
              </small>
            </div>
            <div>
              <span>Cierre de postulaciones</span>
              <strong>
                <time dateTime={j.endsAt}>{formatDate(j.endsAt)}</time>
              </strong>
              <small>Confirma la hora exacta en las bases</small>
            </div>
            <div>
              <span>Lugar de trabajo</span>
              <strong>{j.location}</strong>
              <small>{j.modality || "Modalidad: consulta el perfil"}</small>
            </div>
          </div>
        </div>
      </section>
      <div className="container job-detail-layout">
        <article className="job-detail-main">
          {(j.sample || !j.reviewed || inactive) && (
            <div className="job-verification-note">
              <Icon name="check" size={21} />
              <p>
                <strong>
                  {j.sample
                    ? "Esta ficha es una muestra."
                    : inactive
                      ? "Comprueba el estado de este proceso."
                      : "Verifica siempre las bases oficiales."}
                </strong>{" "}
                {j.sample
                  ? "No acredita una oferta real vigente."
                  : inactive
                    ? "El plazo puede haber terminado, la fuente puede haber retirado el proceso o la consulta puede estar desactualizada. Este portal no confirma inscripciones."
                    : "Los datos se extrajeron automáticamente y pueden cambiar. La entidad es la referencia definitiva para requisitos, montos y fechas."}
              </p>
            </div>
          )}
          <section className="job-content-section">
            <p className="eyebrow">EL PERFIL QUE BUSCA LA ENTIDAD</p>
            <h2>¿A quién está dirigida?</h2>
            <p>{j.audience}</p>
            <dl className="job-condition-grid">
              <div>
                <dt>Tipo de convocatoria</dt>
                <dd>{j.type}</dd>
              </div>
              <div>
                <dt>Duración del contrato</dt>
                <dd>
                  {j.contractDuration ||
                    "No identificada. Revisa el perfil oficial."}
                </dd>
              </div>
              <div>
                <dt>Costo de postulación</dt>
                <dd>
                  {j.applicationCost ||
                    "No identificado en los datos extraídos. Confírmalo en las bases."}
                </dd>
              </div>
              <div>
                <dt>Servicio del portal</dt>
                <dd>
                  Consultar y guardar convocatorias en Convoca Perú es gratuito.
                </dd>
              </div>
            </dl>
          </section>
          <section className="job-content-section">
            <p className="eyebrow">ANTES DE PREPARAR TUS DOCUMENTOS</p>
            <h2>Requisitos para postular</h2>
            {j.requirements.length ? (
              <ul className="job-requirements">
                {j.requirements.map((text, i) => (
                  <li key={i}>
                    <Icon name="check" size={18} />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="missing-data">
                <strong>
                  El detalle del perfil está pendiente de extracción.
                </strong>
                <p>
                  No se han confirmado carreras, experiencia ni cursos. Abre el
                  perfil adjunto o el portal oficial antes de preparar tu
                  postulación.
                </p>
              </div>
            )}
          </section>
          <section className="job-content-section">
            <p className="eyebrow">SOBRE EL TRABAJO</p>
            <h2>¿En qué consiste el puesto?</h2>
            {j.responsibilities.length ? (
              <ul className="job-requirements">
                {j.responsibilities.map((text, i) => (
                  <li key={i}>
                    <span className="list-number">{i + 1}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                {j.summary} El documento del perfil contiene la descripción
                completa de funciones.
              </p>
            )}
          </section>
          <section className="job-content-section" id="postular">
            <p className="eyebrow">PASO A PASO</p>
            <h2>Cómo preparar y presentar tu postulación</h2>
            <ol className="application-steps">
              {j.steps.map((text, i) => (
                <li key={i}>
                  <span>{i + 1}</span>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
            {j.applicationEmail && (
              <p className="application-channel">
                <Icon name="mail" size={20} />
                <span>
                  Correo indicado en el cronograma
                  <br />
                  <a href={"mailto:" + j.applicationEmail}>
                    {j.applicationEmail}
                  </a>
                </span>
              </p>
            )}
            <p className="muted">
              Convoca Perú no recibe tu postulación ni envía documentos a la
              entidad.
            </p>
          </section>
          <section className="job-content-section">
            <p className="eyebrow">FUENTES PARA TOMAR TU DECISIÓN</p>
            <h2>Bases y documentos oficiales</h2>
            {j.documents.length ? (
              <div className="job-documents">
                {j.documents.map((doc) => (
                  <a
                    key={doc.url}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon name="download" size={20} />
                    <span>
                      {doc.label}
                      <small>Archivo alojado por la entidad</small>
                    </span>
                    <Icon name="external" size={16} />
                  </a>
                ))}
              </div>
            ) : (
              <p>
                Los documentos se consultan en el portal oficial de la entidad.
              </p>
            )}
            <a
              className="text-link"
              href={j.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir ficha oficial <Icon name="external" size={17} />
            </a>
            {j.checkedAt && (
              <p className="source-checked">
                Última consulta de la fuente:{" "}
                {new Date(j.checkedAt).toLocaleString("es-PE", {
                  timeZone: "America/Lima",
                })}{" "}
                · Lima
              </p>
            )}
          </section>
        </article>
        <aside className="job-apply-aside">
          <div className="job-apply-card">
            <p className="eyebrow">TU PRÓXIMO PASO</p>
            <h2>
              {inactive
                ? "Revisa el estado oficial"
                : j.availability === "upcoming"
                  ? "Prepara tu postulación"
                  : "Postula con la información completa"}
            </h2>
            <div className="application-window">
              <div>
                <span>Inicio de postulaciones</span>
                <strong>
                  {j.startsAt
                    ? formatDate(j.startsAt)
                    : "Consulta el cronograma"}
                </strong>
              </div>
              <div>
                <span>Último día indicado</span>
                <strong>{formatDate(j.endsAt)}</strong>
              </div>
            </div>
            <DeadlineBadge
              endsAt={j.endsAt}
              startsAt={j.startsAt}
              availability={j.availability}
            />
            <a
              href={j.sourceUrl}
              className="button-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              {inactive
                ? "Consultar estado en la entidad"
                : "Ir al portal para postular"}
              <Icon name="external" size={17} />
            </a>
            <SaveButton slug={j.key} full />
            <ShareButton title={j.title} url={j.href} />
            <small>
              La entidad establece el canal, los documentos y la hora de cierre.
              Confírmalos antes de enviar.
            </small>
          </div>
          <div className="cv-job-cta">
            <span className="assistant-symbol">CV</span>
            <h3>Prepara un CV para este puesto</h3>
            <p>
              Revisa su estructura, compara palabras clave y organiza tu
              experiencia sin inventar información.
            </p>
            <Link
              className="button-secondary"
              href={"/asistente-cv?convocatoria=" + encodeURIComponent(j.key)}
            >
              Revisar mi CV <Icon name="arrow" size={17} />
            </Link>
            <small>Tu CV se analiza en tu navegador.</small>
          </div>
        </aside>
      </div>
    </main>
  );
}
