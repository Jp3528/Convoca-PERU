import type { MetadataRoute } from "next";
import { indexable } from "@/lib/portal-config";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/guardados"],
    },
    sitemap: indexable()
      ? (process.env.NEXT_PUBLIC_SITE_URL || "") + "/sitemap.xml"
      : undefined,
  };
}
