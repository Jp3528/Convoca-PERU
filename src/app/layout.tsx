import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import Link from "next/link";
import { Brand } from "@/components/Brand";
import { SiteHeader } from "@/components/SiteHeader";
import { Icon } from "@/components/Icon";
import "./globals.css";
import "./identity.css";
import { indexable, publisherId, adsEnabled } from "@/lib/portal-config";
import { AdPreferences } from "@/components/AdPreferences";
export const dynamic = "force-dynamic";

const heading = DM_Sans({ variable: "--font-heading", subsets: ["latin"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://convocaperu.pe";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Convoca Perú · Tu próximo paso empieza aquí",
    template: "%s | Convoca Perú",
  },
  description:
    "Explora convocatorias, prácticas y empleos en Perú. Compara requisitos, guarda tus favoritas y consulta la fuente de cada oportunidad.",
  openGraph: {
    title: "Convoca Perú · Tu próximo paso empieza aquí",
    description: "Prácticas, empleos y convocatorias CAS en un solo lugar.",
    url: siteUrl,
    siteName: "Convoca Perú",
    type: "website",
    locale: "es_PE",
  },
  robots: { index: indexable(), follow: true },
  other: publisherId()
    ? { "google-adsense-account": publisherId() }
    : undefined,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={heading.variable + " " + body.variable}
    >
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="container footer-grid">
            <div className="footer-about">
              <Brand />
              <p>
                Conectamos tu talento con tu próximo paso. Oportunidades y
                herramientas para construir tu camino profesional.
              </p>
              <span className="footer-location">
                <Icon name="pin" size={16} /> Hecho para el talento del Perú
              </span>
            </div>
            <div>
              <h2>Encuentra tu oportunidad</h2>
              <Link href="/convocatorias">Todas las convocatorias</Link>
              <Link href="/convocatorias?tipo=Preprofesional">
                Prácticas preprofesionales
              </Link>
              <Link href="/convocatorias?tipo=Profesional">
                Prácticas profesionales
              </Link>
              <Link href="/convocatorias?tipo=CAS">Convocatorias CAS</Link>
            </div>
            <div>
              <h2>Estamos para ayudarte</h2>
              <Link href="/blog">Guías y consejos</Link>
              <Link href="/guardados">Mis guardados</Link>
              <Link href="/asistente-cv">Asistente de CV y revisión ATS</Link>
              <Link href="/contacto">Contacto y consultas</Link>
              <Link href="/nosotros">Sobre Convoca Perú</Link>
              <Link href="/admin">Preparar convocatoria</Link>
            </div>
          </div>
          <div className="container footer-bottom">
            <span>
              © {new Date().getFullYear()} Convoca Perú. Portal independiente.
            </span>
            <div>
              <Link href="/privacidad">Privacidad</Link>
              <Link href="/terminos">Términos de uso</Link>
            </div>
          </div>
          <p className="container footer-disclaimer">
            Verifica siempre las bases y fechas en el portal de la entidad. No
            gestionamos contrataciones ni cobramos por postular.
          </p>
          <div className="container">
            <AdPreferences enabled={adsEnabled()} />
          </div>
        </footer>
      </body>
    </html>
  );
}
