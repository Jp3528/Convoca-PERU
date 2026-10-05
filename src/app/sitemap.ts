import type { MetadataRoute } from "next";
import { articles, opportunities } from "@/lib/data";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://convocaperu.pe";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/convocatorias", "/blog", "/contacto", "/privacidad", "/terminos"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...opportunities.map((opportunity) => ({
      url: `${baseUrl}/convocatorias/${opportunity.slug}`,
      lastModified: new Date(`${opportunity.publishedAt}T12:00:00-05:00`),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...articles.map((article) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: new Date(`${article.publishedAt}T12:00:00-05:00`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
