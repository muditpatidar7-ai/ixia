import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/influencer/login", "/influencer/dashboard", "/api"],
    },
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}