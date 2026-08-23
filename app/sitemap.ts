import type { MetadataRoute } from "next";

const SITE_URL = "https://tutor.aravindpradee.me";

// One entry: the whole app is a single page whose tabs are client state, not
// routes.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
