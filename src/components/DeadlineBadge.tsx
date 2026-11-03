import { daysUntil, formatDate } from "@/lib/data";
import { Icon } from "./Icon";
import type { Discovery } from "@/lib/import-types";
export function DeadlineBadge({
  endsAt,
  startsAt,
  availability = "open",
}: {
  endsAt: string;
  startsAt?: string;
  availability?: Discovery["availability"];
}) {
  const days = daysUntil(endsAt);
  const label =
    availability === "removed"
      ? "Retirada de la fuente"
      : availability === "stale"
        ? "Vigencia por confirmar"
        : days < 0
          ? "Plazo finalizado"
          : startsAt && daysUntil(startsAt) > 0
            ? "Abre el " + formatDate(startsAt)
            : days === 0
              ? "Cierra hoy"
              : days === 1
                ? "Cierra mañana"
                : `Cierra en ${days} días`;
  return (
    <span
      className={
        "deadline-badge " +
        (days < 0 || availability === "removed"
          ? "is-closed"
          : availability === "stale"
            ? "is-pending"
            : startsAt && daysUntil(startsAt) > 0
              ? "is-upcoming"
              : days <= 3
                ? "is-urgent"
                : "is-open")
      }
    >
      <Icon name="clock" size={16} />
      {label}
    </span>
  );
}
