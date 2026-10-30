"use client";
import Link from "next/link";
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main id="contenido" className="page-shell">
      <section className="empty-state">
        <p className="eyebrow">INTÉNTALO DE NUEVO</p>
        <h1>No pudimos cargar esta página.</h1>
        <p>
          Puede haber una interrupción temporal. Vuelve a intentarlo en unos
          minutos.
        </p>
        <div className="form-buttons" style={{ justifyContent: "center" }}>
          <button className="button-primary" onClick={() => retry()}>
            Volver a intentar
          </button>
          <Link className="button-secondary" href="/">
            Ir al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
