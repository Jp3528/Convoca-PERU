"use client";
import { useState } from "react";
import { Icon } from "./Icon";
export function ShareButton({
  title,
  url,
  compact = false,
}: {
  title?: string;
  url?: string;
  compact?: boolean;
}) {
  const [status, setStatus] = useState("");
  const [fallback, setFallback] = useState("");
  const linkToCopy = () =>
    url ? new URL(url, window.location.origin).href : window.location.href;
  async function copy() {
    const link = linkToCopy();
    try {
      await navigator.clipboard.writeText(link);
      setStatus("Enlace copiado.");
      setFallback("");
    } catch {
      setFallback(link);
      setStatus("Copia el enlace del campo de abajo.");
    }
  }
  async function share() {
    const link = linkToCopy();
    try {
      if (navigator.share) {
        await navigator.share({ title: title || document.title, url: link });
        setStatus("Enlace compartido.");
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
    await copy();
  }
  return (
    <div className={"share-control " + (compact ? "share-compact" : "")}>
      <div className="share-actions">
        <button
          type="button"
          className={compact ? "text-button" : "button-secondary"}
          onClick={share}
        >
          <Icon name="share" size={17} />
          {compact ? "Compartir" : "Compartir convocatoria"}
        </button>
        <button
          type="button"
          className="icon-button copy-link-button"
          onClick={copy}
          aria-label="Copiar enlace de la convocatoria"
          title="Copiar enlace"
        >
          <Icon name="copy" size={17} />
        </button>
      </div>
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
