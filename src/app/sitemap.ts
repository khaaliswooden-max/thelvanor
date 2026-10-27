import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ["/", "/thesis", "/keg-1", "/keg-1/log", "/research", "/company"].map((p) => ({
    url: `${site.url}${p}`,
    lastModified: now,
    changeFrequency: p === "/keg-1/log" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : 0.7,
  }));
}
