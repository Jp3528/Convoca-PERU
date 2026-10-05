import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terminos y Condiciones",
  description:
    "Terminos de uso y condiciones del servicio informativo de Convoca Peru.",
};

export default function TerminosPage() {
  return (
    <main className="page-shell">
      <nav className="mini-nav" aria-label="Secciones">
        <Link href="/">Inicio</Link>
        <Link href="/convocatorias">Convocatorias</Link>
        <Link href="/blog">Guias</Link>
        <Link href="/contacto">Contacto</Link>
      </nav>

      <article className="legal-card" style={{ maxWidth: "860px", margin: "0 auto" }}>
        <p className="eyebrow">Aviso Legal</p>
        <h1>Terminos y Condiciones de Uso</h1>
        <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
          Vigente para todos los usuarios que acceden a Convoca Peru.
        </p>

        <section style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
          <h2>1. Naturaleza del Servicio</h2>
          <p>
            <strong>Convoca Peru</strong> es un medio digital de difusion y recopilacion informativa
            de oportunidades laborales publicas (CAS, 728, 276) y privadas, asi como programas de
            practicas preprofesionales y profesionales en el territorio peruano.
          </p>

          <h2>2. Caracter Gratuito e Informativo</h2>
          <p>
            El acceso a toda la informacion, fichas de convocatoria, filtros por carrera y guias es
            completamente libre y gratuito. Convoca Peru <strong>no cobra derechos de postulacion</strong>,
            no vende expedientes ni actua como agencia de colocacion remunerada.
          </p>

          <h2>3. Responsabilidad sobre las Fuentes</h2>
          <p>
            Cada ficha informativa enlaza directamente a la fuente oficial (gob.pe, plataformas
            institucionales o bolsas corporativas). Es responsabilidad exclusiva de cada postulante
            revisar las bases completas, cronogramas y anexos actualizados en la plataforma oficial
            antes de enviar su postulacion. Convoca Peru no es responsable de modificaciones,
            postergaciones o cancelaciones dispuestas por las entidades convocantes.
          </p>

          <h2>4. Propiedad Intelectual y Uso Permitido</h2>
          <p>
            Los articulos del blog, analisis editoriales, logotipos y diseño de la interfaz son
            propiedad de Convoca Peru. Se permite la cita o referencia de los contenidos siempre
            que se mencione expresamente la fuente y se coloque un enlace al portal.
          </p>

          <h2>5. Contacto para Correcciones</h2>
          <p>
            Si detectas una convocatoria con fecha vencida, enlace caido o informacion que deba ser
            corregida, puedes reportarlo inmediatamente a traves de nuestra pagina de{" "}
            <Link href="/contacto" style={{ color: "var(--primary)", fontWeight: 700 }}>
              Contacto
            </Link>{" "}
            o al correo <strong>contacto@convocaperu.pe</strong>.
          </p>
        </section>
      </article>
    </main>
  );
}
