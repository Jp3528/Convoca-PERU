"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef } from "react";
import { Brand } from "./Brand";
import { Icon } from "./Icon";
import { SavedCount } from "./SavedOpportunities";
const links = [
  { href: "/convocatorias", label: "Convocatorias" },
  { href: "/asistente-cv", label: "Asistente de CV" },
  { href: "/blog", label: "Guías y consejos" },
  { href: "/contacto", label: "Contacto" },
];
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <header className="site-header" onKeyDown={event=>{if(event.key==="Escape"&&open){setOpen(false);menuButton.current?.focus();}}}>
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link
            className="saved-link"
            href="/guardados"
            aria-label="Convocatorias guardadas"
            aria-current={pathname === "/guardados" ? "page" : undefined}
          >
            <Icon name="bookmark" />
            <span>Guardados</span>
            <SavedCount />
          </Link>
          <Link className="button-primary header-publish" href="/admin">
            Publicar convocatoria <Icon name="arrow" size={16} />
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="menu-toggle icon-button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <Icon name="close" />
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <nav
        id="mobile-nav"
        className="mobile-nav"
        aria-label="Navegación móvil"
        hidden={!open}
      >
        {[...links, { href: "/admin", label: "Publicar convocatoria" }].map(
          (link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
            >
              {link.label}
              <Icon name="arrow" size={17} />
            </Link>
          ),
        )}
      </nav>
    </header>
  );
}
