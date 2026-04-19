import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://lamtkom.ads-shwaiter10.workers.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/games", "/pricing", "/about", "/contact", "/terms", "/privacy"],
        disallow: [
          "/admin",
          "/account",
          "/dashboard",
          "/login",
          "/register",
          "/payment",
          "/api",
          "/game",
          "/games/codenames",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}