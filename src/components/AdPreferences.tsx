"use client";
import { useState } from "react";
declare global {
  interface Window {
    googlefc?: {
      callbackQueue: Array<() => void>;
      showRevocationMessage?: () => void;
    };
  }
}
export function AdPreferences({ enabled }: { enabled: boolean }) {
  const [notice, setNotice] = useState("");
  if (!enabled) return null;
  return (
    <div>
      <button
        className="text-button"
        type="button"
        onClick={() => {
          const cmp = window.googlefc;
          if (cmp?.showRevocationMessage) {
            cmp.callbackQueue.push(cmp.showRevocationMessage);
            setNotice("");
          } else
            setNotice(
              "Las opciones publicitarias no están disponibles en este momento. Puedes consultar la política de privacidad.",
            );
        }}
      >
        Preferencias de privacidad publicitaria
      </button>
      <span className="muted" role="status">
        {notice}
      </span>
    </div>
  );
}
