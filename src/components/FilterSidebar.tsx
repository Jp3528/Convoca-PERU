"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
export function FilterSidebar({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="filter-sidebar">
      <div className="sidebar-heading">
        <h2>
          <Icon name="filter" /> Filtros de búsqueda
        </h2>
        <button
          className="filter-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="additional-filters"
          onClick={() => setOpen(!open)}
        >
          {open ? "Ocultar" : "Mostrar"}
        </button>
        <Link href="/convocatorias">Limpiar</Link>
      </div>
      <div
        id="additional-filters"
        className={open ? "additional-filters is-open" : "additional-filters"}
      >
        {children}
      </div>
    </aside>
  );
}
