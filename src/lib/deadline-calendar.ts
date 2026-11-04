export type DeadlineEvent = {
  key: string;
  title: string;
  organization: string;
  endsAt: string;
  sourceUrl: string;
};

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

export function deadlineCalendar(event: DeadlineEvent, now = new Date()) {
  const date = new Date(`${event.endsAt}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(event.endsAt) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== event.endsAt ||
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
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Convoca Peru//Cierre de postulaciones//ES",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.key}-cierre@convoca-peru.vercel.app`,
    `DTSTAMP:${now
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z")}`,
    `DTSTART;VALUE=DATE:${event.endsAt.replace(/-/g, "")}`,
    "DURATION:P1D",
    `SUMMARY:${calendarText(`Cierre de postulación · ${event.title}`)}`,
    `DESCRIPTION:${calendarText(
      [
        event.organization,
        `Último día indicado: ${event.endsAt}.`,
        "Confirma la fecha y la hora exacta en las bases oficiales antes de enviar tu postulación.",
        `Fuente: ${source.href}`,
      ].join("\n"),
    )}`,
    `URL:${source.href}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(foldLine)
    .join("\r\n");
}
