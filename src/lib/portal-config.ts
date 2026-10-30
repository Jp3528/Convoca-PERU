export const demoEnabled = () => process.env.PORTAL_DEMO_MODE === "true";
export const indexable = () =>
  process.env.SITE_INDEXABLE === "true" && !demoEnabled();
export function publisherId() {
  const id = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
  return /^ca-pub-\d{16}$/.test(id) ? id : "";
}
export function adsEnabled() {
  return (
    process.env.NEXT_PUBLIC_ADSENSE_APPROVED === "true" &&
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" &&
    !!publisherId() &&
    process.env.NEXT_PUBLIC_ADSENSE_CONSENT_READY === "true" &&
    indexable()
  );
}
