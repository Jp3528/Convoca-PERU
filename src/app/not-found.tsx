import Link from "next/link";
import { Icon } from "@/components/Icon";
export default function NotFound() {
  return (
    <main id="contenido" className="page-shell">
      <div className="empty-state">
        <p className="eyebrow">ERROR 404</p>
        <span className="empty-icon">
          <Icon name="search" size={32} />
        </span>
        <h1>Este camino no lleva a una oportunidad.</h1>
        <p>
          La página que buscas no está disponible. Puedes seguir explorando las
          convocatorias o volver al inicio.
        </p>
        <Link className="button-primary" href="/convocatorias">
          Explorar convocatorias <Icon name="arrow" size={17} />
        </Link>
      </div>
    </main>
  );
}
