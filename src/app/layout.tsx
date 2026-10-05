import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://convocaperu.pe";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Convoca Peru | Convocatorias laborales, practicas y CAS en Peru",
    template: "%s | Convoca Peru",
  },
  description:
    "Portal independiente de convocatorias de trabajo, practicas preprofesionales, practicas profesionales y empleo CAS en Peru con fuentes oficiales verificadas.",
  keywords: [
    "convocatorias peru",
    "practicas preprofesionales lima",
    "practicas profesionales peru",
    "convocatorias cas 2026",
    "empleos peru gob pe",
    "bolsa de trabajo sunat",
    "practicas bcp",
  ],
  authors: [{ name: "Convoca Peru Editorial" }],
  creator: "Convoca Peru",
  openGraph: {
    title: "Convoca Peru | Convocatorias y Practicas Verificadas",
    description:
      "Encuentra convocatorias laborales, practicas y guias para postular mejor en Peru sin perderte entre PDFs.",
    url: siteUrl,
    siteName: "Convoca Peru",
    type: "website",
    locale: "es_PE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Convoca Peru | Convocatorias Laborales y Practicas",
    description:
      "Oportunidades laborales y formativas verificadas en el sector publico y privado del Peru.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${serif.variable}`}>
      <body>
        {children}
        <footer className="site-footer">
          <div style={{ display: "grid", gap: "6px" }}>
            <p>
              <strong>Convoca Peru</strong> · Portal independiente de difusion laboral y oportunidades formativas.
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              No cobramos por postulaciones. Toda la informacion enlaza de forma transparente a las fuentes
              oficiales de cada entidad convocante. © {new Date().getFullYear()} Convoca Peru.
            </p>
          </div>
          <div>
            <Link href="/convocatorias">Convocatorias</Link>
            <Link href="/blog">Guias</Link>
            <Link href="/admin">Panel editorial</Link>
            <Link href="/contacto">Contacto</Link>
            <Link href="/privacidad">Privacidad</Link>
            <Link href="/terminos">Terminos</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
