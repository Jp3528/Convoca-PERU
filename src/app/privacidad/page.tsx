import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Privacidad" };
export default function Privacy() {
  return (
    <main id="contenido" className="page-shell">
      <article className="legal-card">
        <p className="eyebrow">TRANSPARENCIA</p>
        <h1>Tu información y tu privacidad.</h1>
        <p>
          Esta página describe los datos utilizados por Convoca Perú y las
          funciones del portal. Actualizada en octubre de 2026.
        </p>
        <h2>Guardados y borradores personales</h2>
        <p>
          Las convocatorias favoritas y los borradores de consultas se guardan
          en el almacenamiento local de tu navegador. No requieren una cuenta ni
          se sincronizan entre dispositivos. Puedes quitarlos desde la interfaz
          o borrar los datos del sitio en tu navegador.
        </p>
        <h2>Asistente de CV</h2>
        <p>El archivo y el texto de tu CV se procesan en la memoria de tu navegador. No se envían al servidor, a Gemini ni a la entidad convocante. No se guardan en el almacenamiento del navegador. Puedes borrarlos con “Borrar todo”; también se pierden al recargar o cerrar la pestaña. Los archivos descargados permanecen en tu dispositivo.</p>
        <p>Si solicitas orientación de IA, el servidor envía a Google Gemini únicamente el título, entidad y requisitos públicos de la convocatoria seleccionada. No envía tu CV, nombre, contacto ni el perfil personalizado. La opción requiere confirmar mayoría de edad. En la modalidad gratuita, Google puede usar los datos públicos enviados para mejorar sus productos; consulta las <a className="text-link" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">condiciones de Gemini</a>. La herramienta no muestra publicidad ni carga el servicio de anuncios.</p>
        <p>La puntuación de estructura y palabras clave es orientativa y se calcula localmente. No equivale al resultado de un ATS, no verifica los antecedentes y no garantiza elegibilidad ni selección.</p>
        <h2>Consultas enviadas</h2>
        <p>
          Al enviar el formulario, recibimos tu nombre, correo, motivo, mensaje
          y las referencias opcionales que aportes. Estos datos se guardan en el
          servidor y se muestran únicamente en el panel editorial protegido para
          atender la consulta. Evita incluir documentos de identidad,
          contraseñas o datos sensibles.
        </p>
        <h2>Acceso editorial y seguridad</h2>
        <p>
          El acceso al panel utiliza una cookie de sesión técnica, con duración
          limitada y acceso restringido desde JavaScript. El portal aplica
          controles de origen y límites de solicitudes para proteger los
          formularios. Para los límites se utiliza una referencia derivada de la
          conexión, sin mostrarla en el panel público.
        </p>
        <h2>Proveedores de alojamiento y almacenamiento</h2>
        <p>
          En la publicación en Vercel, el alojamiento procesa las solicitudes
          necesarias para servir la web y Supabase almacena los datos del
          portal. En la versión local se utiliza almacenamiento en el equipo
          donde se ejecuta el servidor. Los proveedores pueden tratar datos
          técnicos de acuerdo con sus propias políticas.
        </p>
        <h2>Publicidad de Google</h2>
        <p>
          La publicidad real permanece desactivada hasta configurar la cuenta y
          el consentimiento correspondiente. Si se activa Google AdSense, Google
          y sus proveedores pueden usar cookies, identificadores, direcciones IP
          u otros datos para servir, medir o personalizar anuncios según las
          opciones disponibles y el consentimiento aplicable.
        </p>
        <p>
          Consulta{" "}
          <a
            className="text-link"
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            cómo usa Google los datos en los sitios de sus colaboradores
          </a>{" "}
          y sus{" "}
          <a
            className="text-link"
            href="https://myadcenter.google.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            opciones de anuncios
          </a>
          . Cuando corresponda, los mensajes de consentimiento permitirán
          gestionar tus preferencias. Los espacios de vista previa locales no
          cargan anuncios ni herramientas publicitarias de Google.
        </p>
        <h2>Solicitudes sobre tus datos</h2>
        <p>
          Para consultar o solicitar la corrección o eliminación de una consulta
          que enviaste, utiliza el formulario de contacto e indica su
          referencia. El equipo podrá solicitar la información necesaria para
          comprobar la solicitud.
        </p>
        <h2>Enlaces a entidades</h2>
        <p>
          Los portales externos tienen sus propias condiciones y privacidad.
          Revisa esa información antes de enviar tu CV o documentos para
          postular.
        </p>
        <Link className="button-primary" href="/contacto">
          Enviar una consulta de privacidad
        </Link>
      </article>
    </main>
  );
}
