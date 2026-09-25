import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-25");

  return [
    { url: canonicalUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: canonicalUrl("/platform"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: canonicalUrl("/register"), lastModified, changeFrequency: "monthly", priority: 0.8 },
  ];
}