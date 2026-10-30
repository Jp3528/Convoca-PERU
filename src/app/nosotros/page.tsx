import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Sobre Convoca Perú" };
export default function About() {
  return (
    <main id="contenido" className="page-shell">
      <article className="legal-card">
        <p className="eyebrow">SOBRE CONVOCA PERÚ</p>
        <h1>Más claridad para encontrar tu siguiente oportunidad.</h1>
        <p>
          Convoca Perú es un portal independiente de información laboral y
          orientación para postulantes. Organizamos oportunidades de prácticas,
          empleo y convocatorias CAS para facilitar su consulta.
        </p>
        <h2>Cómo trabajamos</h2>
        <p>
          El servidor consulta listados oficiales y muestra sus hallazgos con
          enlaces, fechas y un aviso para verificar las bases. Estas
          publicaciones automáticas se distinguen de las fichas editoriales, que
          requieren revisar la fuente y completar requisitos y pasos antes de
          publicarse. Las guías ofrecen orientación y ejemplos; las bases
          oficiales de cada proceso son la referencia definitiva.
        </p>
        <h2>Tu postulación es directa</h2>
        <p>
          Las postulaciones se realizan en el portal de la entidad convocante.
          Convoca Perú no realiza contrataciones, no garantiza una selección y
          no cobra por acceder a la información.
        </p>
        <h2>Correcciones y fuentes</h2>
        <p>
          Si encuentras una fecha desactualizada o un enlace que necesita
          revisión, puedes reportarlo desde la ficha. Cada consulta recibe una
          referencia y queda disponible para revisión editorial.
        </p>
        <h2>Cómo se financia el portal</h2>
        <p>
          El proyecto contempla financiar su mantenimiento mediante espacios
          publicitarios identificados como publicidad. Los anuncios, cuando
          estén activos, se mostrarán separados de los enlaces para postular y
          no determinarán la información de las fichas.
        </p>
        <h2>Contacto</h2>
        <p>
          Utiliza nuestro formulario para enviar consultas, sugerencias o
          fuentes de convocatorias.
        </p>
        <Link className="button-primary" href="/contacto">
          Contactar con el equipo
        </Link>
      </article>
    </main>
  );
}
