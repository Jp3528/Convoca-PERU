import Link from "next/link";
import { careers, departments } from "@/lib/data";

export function SearchPanel({
  compact = false,
  defaults,
}: {
  compact?: boolean;
  defaults?: Record<string, string | undefined>;
}) {
  return (
    <form
      className={`search-panel ${compact ? "search-panel-compact" : ""}`}
      action="/convocatorias"
    >
      <label>
        <span>Carrera o palabra clave</span>
        <input
          name="q"
          placeholder="Ej. Administracion, Sistemas, Derecho"
          defaultValue={defaults?.q ?? ""}
        />
      </label>
      <label>
        <span>Departamento</span>
        <select name="departamento" defaultValue={defaults?.departamento ?? ""}>
          <option value="">Todo el Peru</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Tipo</span>
        <select name="tipo" defaultValue={defaults?.tipo ?? ""}>
          <option value="">Todos</option>
          <option value="Preprofesional">Preprofesional</option>
          <option value="Profesional">Profesional</option>
          <option value="Empleo">Empleo</option>
          <option value="CAS">CAS</option>
        </select>
      </label>
      <button className="button-primary" type="submit">
        Buscar convocatorias
      </button>
      {!compact ? (
        <div className="popular-searches" aria-label="Carreras frecuentes">
          {careers.slice(0, 5).map((career) => (
            <Link key={career} href={`/convocatorias?q=${encodeURIComponent(career)}`}>
              {career}
            </Link>
          ))}
        </div>
      ) : null}
    </form>
  );
}
