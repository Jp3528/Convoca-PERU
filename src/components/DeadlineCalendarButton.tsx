"use client";

import { useState } from "react";
import { deadlineCalendar, type DeadlineEvent } from "@/lib/deadline-calendar";
import { downloadText } from "@/lib/browser-storage";
import { Icon } from "./Icon";

export function DeadlineCalendarButton({ event }: { event: DeadlineEvent }) {
  const [message, setMessage] = useState("");
  function download() {
    try {
      downloadText(
        `cierre-${event.key}.ics`,
        deadlineCalendar(event),
        "text/calendar",
      );
      setMessage(
        "Archivo .ics preparado. Ábrelo o impórtalo en tu calendario.",
      );
    } catch {
      setMessage(
        "No se pudo preparar el calendario. Consulta el cierre en las bases oficiales.",
      );
    }
  }
  return (
    <div className="deadline-calendar">
      <button type="button" className="button-secondary" onClick={download}>
        <Icon name="calendar" size={18} />
        Guardar cierre en mi calendario
      </button>
      <small>
        Descarga la fecha indicada en la ficha como evento de día completo.
      </small>
      <p role="status">{message}</p>
    </div>
  );
}
