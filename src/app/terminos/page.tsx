import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Términos de uso" };
export default function Terms() {
  return (
    <main id="contenido" className="page-shell">
      <article className="legal-card">
        <p className="eyebrow">SOBRE EL PORTAL</p>
        <h1>Información para dar tu siguiente paso.</h1>
        <h2>Un portal independiente</h2>
        <p>
          Convoca Perú organiza información laboral y publica guías para
          postulantes. Las entidades mencionadas no representan alianzas con el
          portal. Las muestras del catálogo local están identificadas y no
          acreditan ofertas reales vigentes.
        </p>
        <h2>Revisa la fuente antes de postular</h2>
        <p>
          Consulta siempre las bases, requisitos, importes y fechas en el portal
          de la entidad. Los procesos pueden cambiar después de una publicación.
          Las guías son orientativas y no sustituyen las indicaciones oficiales
          del proceso.
        </p>
        <h2>Postulación directa y acceso gratuito</h2>
        <p>
          Convoca Perú no realiza contrataciones ni recibe expedientes.
          Consultar el catálogo y guardar oportunidades es gratuito. La
          postulación se completa con la entidad convocante.
        </p>
        <h2>Publicidad</h2>
        <p>
          Los espacios publicitarios se identifican como publicidad y se
          presentan separados de los controles y enlaces del portal. La
          publicidad no implica que el equipo recomiende al anunciante ni
          garantiza sus servicios.
        </p>
        <h2>Correcciones y contenidos</h2>
        <p>
          Puedes reportar errores o proponer una convocatoria mediante el
          formulario. El equipo revisa el contenido antes de publicarlo. El
          envío de una propuesta no garantiza su publicación.
        </p>
        <h2>Tus guardados</h2>
        <p>
          Los favoritos se conservan en tu navegador. Borrar los datos del sitio
          o cambiar de dispositivo puede hacer que dejen de estar disponibles.
        </p>
        <Link className="text-link" href="/contacto">
          Contactar con el equipo →
        </Link>
      </article>
    </main>
  );
}
