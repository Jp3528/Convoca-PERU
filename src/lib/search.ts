import { daysUntil, type Opportunity } from "./data";
export type Filters = {
  q?: string;
  departamento?: string;
  tipo?: string;
  sector?: string;
  modalidad?: string;
  estado?: string;
  orden?: string;
};
export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
export function filterOpportunities(
  list: Opportunity[],
  filters: Filters,
  now = new Date(),
) {
  const terms = normalize(filters.q || "")
    .split(/\s+/)
    .filter(Boolean);
  return list
    .filter((o) => {
      const text = normalize(
        [o.title, o.organization, o.summary, o.department, ...o.careers].join(
          " ",
        ),
      );
      const active = daysUntil(o.endsAt, now) >= 0;
      return (
        terms.every((term) => text.includes(term)) &&
        (!filters.departamento || o.department === filters.departamento) &&
        (!filters.tipo || o.type === filters.tipo) &&
        (!filters.sector || o.sector === filters.sector) &&
        (!filters.modalidad || o.modality === filters.modalidad) &&
        (!filters.estado ||
          (filters.estado === "vigentes"
            ? active
            : filters.estado === "finalizadas"
              ? !active
              : true))
      );
    })
    .sort((a, b) => {
      if (filters.orden === "cierre") return a.endsAt.localeCompare(b.endsAt);
      if (filters.orden === "vacantes") return b.vacancies - a.vacancies;
      const aActive = daysUntil(a.endsAt, now) >= 0;
      const bActive = daysUntil(b.endsAt, now) >= 0;
      return (
        Number(bActive) - Number(aActive) ||
        b.publishedAt.localeCompare(a.publishedAt)
      );
    });
}
export function deadline(value: string) {
  const days = daysUntil(value);
  return days < 0
    ? "Finalizada"
    : days === 0
      ? "Cierra hoy"
      : days === 1
        ? "Cierra mañana"
        : `Cierra en ${days} días`;
}
export function organizationShort(name: string) {
  const acronym = name.match(/\(([^)]+)\)/)?.[1];
  return (
    acronym ||
    (name.includes("CONTRALORIA")
      ? "Contraloría"
      : name.includes("PODER JUDICIAL")
        ? "Poder Judicial"
        : name)
  );
}
export function initials(name: string) {
  const short = organizationShort(name);
  return short.length <= 7
    ? short
    : short
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0])
        .join("");
}
export function display(value: string) {
  return value
    .replace(/Publico/g, "Público")
    .replace(/Hibrido/g, "Híbrido")
    .replace(/Junin/g, "Junín")
    .replace(/Ancash/g, "Áncash")
    .replace(/San Martin/g, "San Martín");
}
