"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}
type AdProps = { client: string; slot: string; preview?: boolean };
export function AdSlot(props: AdProps) {
  const pathname = usePathname();
  return <AdUnit key={pathname} {...props} />;
}
function AdUnit({ client, slot, preview = false }: AdProps) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const container = useRef<HTMLModElement>(null);
  const initialized = useRef(false);
  useEffect(() => {
    if (!ready || !container.current || initialized.current || preview) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialized.current = true;
    } catch {
      /* An unavailable ad leaves an empty reserved slot. */
    }
  }, [ready, preview]);
  if (failed) return null;
  if (preview)
    return (
      <aside
        className="ad-placement ad-preview"
        aria-label="Espacio publicitario de demostración"
      >
        <span>PUBLICIDAD · VISTA PREVIA</span>
        <div>Espacio reservado para AdSense</div>
        <small>Los anuncios reales están desactivados.</small>
      </aside>
    );
  return (
    <aside className="ad-placement" aria-label="Publicidad">
      <span>PUBLICIDAD</span>
      <Script
        id="google-adsense"
        async
        src={
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
          client
        }
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
      />
      <ins
        ref={container}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
