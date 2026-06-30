import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "EP Journals",
    description: SITE.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f9f6f3",
    theme_color: "#a16236",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "192x192", type: "image/png" },
    ],
  };
}
