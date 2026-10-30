import { adsEnabled, publisherId } from "@/lib/portal-config";
import { storageProvider } from "@/lib/portal-store";
import { AdSlot } from "./AdSlot";
export function Advertisement({
  placement,
  eligible = true,
}: {
  placement: "home" | "article" | "opportunity";
  eligible?: boolean;
}) {
  const preview =
    process.env.NEXT_PUBLIC_ADSENSE_PREVIEW === "true" &&
    storageProvider() === "local";
  if (preview) return <AdSlot client="" slot="" preview />;
  const slots = {
    home: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME,
    article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE,
    opportunity: process.env.NEXT_PUBLIC_ADSENSE_SLOT_OPPORTUNITY,
  };
  const slot = slots[placement] || "";
  if (!eligible || !adsEnabled() || !/^\d+$/.test(slot)) return null;
  return <AdSlot client={publisherId()} slot={slot} />;
}
