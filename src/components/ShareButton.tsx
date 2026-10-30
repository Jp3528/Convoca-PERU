"use client";
import { useState } from "react";
import { Icon } from "./Icon";
export function ShareButton() {
  const [status, setStatus] = useState("");
  const [fallback, setFallback] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("Enlace copiado.");
      setFallback("");
    } catch {
      setFallback(window.location.href);
      setStatus("Copia el enlace del campo de abajo.");
    }
  }
  return (
    <div className="share-control">
      <button type="button" className="button-secondary" onClick={copy}>
        <Icon name="share" /> Copiar enlace
      </button>
      <span role="status">{status}</span>
      {fallback && (
        <input
          aria-label="Enlace para compartir"
          readOnly
          value={fallback}
          onFocus={(e) => e.target.select()}
        />
      )}
    </div>
  );
}
