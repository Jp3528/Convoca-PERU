import Link from "next/link";
import { departments } from "@/lib/data";
import { display, type Filters } from "@/lib/search";
import { Icon } from "./Icon";
export function SearchPanel({
  compact = false,
  defaults = {},
}: {
  compact?: boolean;
  defaults?: Filters;
}) {
  return (
    <form
      className={"search-panel " + (compact ? "search-panel-compact" : "")}
      action="/convocatorias"
      method="get"
      role="search"
    >
      <label className="search-keyword">
        <span>¿Qué estás buscando?</span>
        <div className="input-with-icon">
          <Icon name="search" />
          <input
            name="q"
            type="search"
            placeholder="Cargo, carrera o entidad"
            defaultValue={defaults.q || ""}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </label>
      <label>
        <span>¿Dónde?</span>
        <div className="input-with-icon">
          <Icon name="pin" />
          <select
            name="departamento"
            defaultValue={defaults.departamento || ""}
          >
            <option value="">Todo el Perú</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {display(d)}
              </option>
            ))}
          </select>
        </div>
      </label>
      <label className="search-type">
        <span>Tipo de oportunidad</span>
        <div className="input-with-icon">
          <Icon name="briefcase" />
          <select name="tipo" defaultValue={defaults.tipo || ""}>
            <option value="">Todas las oportunidades</option>
            <option value="Preprofesional">Prácticas preprofesionales</option>
            <option value="Profesional">Prácticas profesionales</option>
            <option value="Empleo">Empleo</option>
            <option value="CAS">Convocatorias CAS</option>
          </select>
        </div>
      </label>
      {(["sector", "modalidad", "estado", "orden"] as const).map((key) =>
        defaults[key] ? (
          <input key={key} type="hidden" name={key} value={defaults[key]} />
        ) : null,
      )}
      <button className="button-primary" type="submit">
        <Icon name="search" /> Buscar{" "}
        <span className="search-button-extra">oportunidades</span>
      </button>
      {!compact && (
        <div className="popular-searches">
          <span>Búsquedas populares:</span>
          {["Administración", "Sistemas", "Derecho"].map((q) => (
            <Link href={"/convocatorias?q=" + encodeURIComponent(q)} key={q}>
              {q} <Icon name="arrow" size={13} />
            </Link>
          ))}
        </div>
      )}
    </form>
  );
}
