import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de Privacidad",
  description:
    "Politica de privacidad y proteccion de datos personales de Convoca Peru segun la Ley N° 29733.",
};

export default function PrivacyPage() {
  return (
    <main className="page-shell">
      <nav className="mini-nav" aria-label="Secciones">
        <Link href="/">Inicio</Link>
        <Link href="/convocatorias">Convocatorias</Link>
        <Link href="/blog">Guias</Link>
        <Link href="/contacto">Contacto</Link>
      </nav>

      <article className="legal-card" style={{ maxWidth: "860px", margin: "0 auto" }}>
        <p className="eyebrow">Marco Legal y Transparencia</p>
        <h1>Politica de Privacidad y Proteccion de Datos</h1>
        <p style={{ color: "var(--muted)", fontStyle: "italic" }}>
          Ultima actualizacion: Octubre de 2026. En conformidad con la Ley N° 29733 (Ley de Proteccion
          de Datos Personales del Peru) y su Reglamento.
        </p>

        <section style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
          <h2>1. Compromiso de Convoca Peru</h2>
          <p>
            <strong>Convoca Peru</strong> es una plataforma informativa independiente orientada a
            facilitar el acceso y la comprension de convocatorias laborales, practicas
            preprofesionales, practicas profesionales y oportunidades bajo regimen CAS en la
            Republica del Peru. Nuestro principio rector es la proteccion estricta de la privacidad
            de los usuarios que visitan y consultan nuestro portal.
          </p>

          <h2>2. Datos que recopilamos</h2>
          <p>
            Al navegar por nuestro sitio web, no solicitamos registros obligatorios ni recopilamos
            informacion personal sensible (como DNI, datos biometricos o historial bancario). La
            informacion que puede procesarse incluye:
          </p>
          <ul>
            <li>
              <strong>Datos de navegacion tecnica y anonima:</strong> Direccion IP anonimizada, tipo
              de navegador, dispositivo y paginas consultadas, utilizados con fines de medicion de
              rendimiento y estabilidad tecnica.
            </li>
            <li>
              <strong>Formulario de contacto voluntario:</strong> Nombre y correo electronico que el
              usuario proporciona libremente para enviar consultas, reportes o convocatorias.
            </li>
          </ul>

          <h2>3. Finalidad del tratamiento de datos</h2>
          <p>
            Los datos tecnicos y de contacto se utilizan exclusivamente para:
          </p>
          <ul>
            <li>Responder a consultas o solicitudes enviadas a traves del canal editorial.</li>
            <li>Mejorar la navegabilidad y organizacion tematica del portal por carreras y regiones.</li>
            <li>Garantizar la seguridad del servidor y prevenir ataques maliciosos o spam.</li>
          </ul>

          <h2>4. No intermediacion ni cobros</h2>
          <p>
            <strong>Convoca Peru no cobra dinero a ningun postulante</strong> por ver ofertas, postular
            a convocatorias o descargar guias. Todas las oportunidades difundidas redirigen de forma
            transparente a los enlaces y portales oficiales de las entidades públicas o privadas
            convocantes. Nunca proporciones dinero a supuestos intermediarios.
          </p>

          <h2>5. Cookies y servicios de terceros</h2>
          <p>
            El sitio puede utilizar cookies tecnicas necesarias para el funcionamiento y optimizacion
            del servicio. En caso de implementarse herramientas de medicion analitica (ej. Google
            Analytics) o redes publicitarias (ej. Google AdSense), estas se rigen por las politicas
            de privacidad de sus respectivos proveedores y permiten al usuario configurar el bloqueo
            de cookies desde su navegador.
          </p>

          <h2>6. Derechos ARCO</h2>
          <p>
            De conformidad con la Ley N° 29733, todo usuario tiene derecho a ejercer sus derechos de
            Acceso, Rectificacion, Cancelacion y Oposicion (ARCO) sobre los datos que hubiera
            proporcionado voluntariamente. Para solicitarlo, basta con enviar un correo electronico
            a: <strong style={{ color: "var(--primary)" }}>privacidad@convocaperu.pe</strong>.
          </p>

          <h2>7. Enlaces a sitios web de terceros</h2>
          <p>
            Nuestro portal enlaza a sitios web de entidades del Estado (gob.pe) y empresas privadas.
            Convoca Peru no tiene control sobre las politicas de privacidad ni el tratamiento de datos
            en dichos sitios externos, por lo que recomendamos leer las politicas propias de cada
            portal al postular.
          </p>
        </section>
      </article>
    </main>
  );
}
