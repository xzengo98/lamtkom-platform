import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "لمتكم",
    short_name: "لمتكم",
    description:
      "منصة ألعاب عربية للجلسات والتجمعات تضم أكثر من لعبة في مكان واحد.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#040816",
    theme_color: "#040816",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}