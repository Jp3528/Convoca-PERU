import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/portal-store";
import { indexable } from "@/lib/portal-config";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexable()) return [];
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const { opportunities, articles } = await getCatalog();
  return [
    ...[
      "",
      "/convocatorias",
      "/blog",
      "/nosotros",
      "/contacto",
      "/privacidad",
      "/terminos",
    ].map((route) => ({
      url: base + route,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.6,
    })),
    ...opportunities
      .filter((o) => !o.isSample)
      .map((o) => ({
        url: base + "/convocatorias/" + o.slug,
        lastModified: new Date(o.publishedAt + "T12:00:00-05:00"),
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ...articles
      .filter((a) => !a.isSample)
      .map((a) => ({
        url: base + "/blog/" + a.slug,
        lastModified: new Date(a.publishedAt + "T12:00:00-05:00"),
        priority: 0.7,
      })),
  ];
}
