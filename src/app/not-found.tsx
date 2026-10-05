import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell" style={{ textAlign: "center", paddingBlock: "80px 100px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <p className="eyebrow">Error 404</p>
        <h1 style={{ margin: "16px auto", fontSize: "3rem" }}>Pagina no encontrada</h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem", marginBottom: "32px" }}>
          La convocatoria, articulo o enlace que buscas no existe o ha sido trasladado a otra seccion.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link className="button-primary" href="/convocatorias">
            Explorar convocatorias vigentes
          </Link>
          <Link className="button-secondary" href="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
