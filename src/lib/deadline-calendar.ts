export type DeadlineEvent = {
  key: string;
  title: string;
  organization: string;
  endsAt: string;
  sourceUrl: string;
};

export type ApplicationSchedule = DeadlineEvent & { startsAt?: string };

export function isCalendarDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function calendarText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/[;,]/g, "\\$&");
}

// Fold by UTF-8 bytes without splitting accented characters or emoji.
function foldLine(value: string) {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let line = "";
  let bytes = 0;
  for (const character of value) {
    const size = encoder.encode(character).length;
    if (bytes + size > 75) {
      lines.push(line);
      line = " ";
      bytes = 1;
    }
    line += character;
    bytes += size;
  }
  lines.push(line);
  return lines.join("\r\n");
}

function scheduleLines(event: ApplicationSchedule, stamp: string) {
  if (
    !isCalendarDate(event.endsAt) ||
    (event.startsAt &&
      (!isCalendarDate(event.startsAt) || event.startsAt > event.endsAt)) ||
    !/^[a-z0-9-]{1,160}$/.test(event.key)
  ) {
    throw new Error("La fecha o referencia de la convocatoria no es válida.");
  }
  const source = new URL(event.sourceUrl);
  if (
    source.protocol !== "https:" ||
    source.username ||
    source.password ||
    /\s/.test(event.sourceUrl)
  ) {
    throw new Error("La fuente debe ser una dirección pública HTTPS.");
  }
  function entry(
    date: string,
    kind: "apertura" | "cierre",
    title: string,
    dateLabel: string,
  ) {
    return [
      "BEGIN:VEVENT",
      `UID:${event.key}-${kind}@convoca-peru.vercel.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${date.replace(/-/g, "")}`,
      "DURATION:P1D",
      `SUMMARY:${calendarText(`${title} · ${event.title}`)}`,
      `DESCRIPTION:${calendarText(
        [
          event.organization,
          `${dateLabel}: ${date}.`,
          "Confirma la fecha y la hora exacta en las bases oficiales antes de enviar tu postulación.",
          `Fuente: ${source.href}`,
        ].join("\n"),
      )}`,
      `URL:${source.href}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    ];
  }
  const oneDay = event.startsAt === event.endsAt;
  const closing = entry(
    event.endsAt,
    "cierre",
    oneDay ? "Único día de postulación" : "Cierre de postulación",
    oneDay ? "Día indicado" : "Último día indicado",
  );
  if (!event.startsAt || oneDay) return closing;
  return [
    ...entry(
      event.startsAt,
      "apertura",
      "Apertura de postulación",
      "Primer día indicado",
    ),
    ...closing,
  ];
}

export function applicationCalendar(
  events: readonly ApplicationSchedule[],
  now = new Date(),
) {
  if (events.length === 0) throw new Error("No hay fechas para exportar.");
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Convoca Peru//Agenda de postulaciones//ES",
    "CALSCALE:GREGORIAN",
    ...events.flatMap((event) => scheduleLines(event, stamp)),
    "END:VCALENDAR",
    "",
  ]
    .map(foldLine)
    .join("\r\n");
}

export function deadlineCalendar(event: DeadlineEvent, now = new Date()) {
  return applicationCalendar([{ ...event, startsAt: undefined }], now);
}
