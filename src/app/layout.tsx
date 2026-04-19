import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import SiteBackground from "../components/layout/site-background";
import Navbar from "../components/layout/navbar";
import AppResumeRefresh from "../components/app/app-resume-refresh";
import { getViewer } from "../lib/auth/viewer";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://lamtkom.ads-shwaiter10.workers.dev";

const siteName = "لمتكم";
const siteDescription =
  "منصة ألعاب عربية للجلسات والتجمعات، تضم لمتكم وبرا السالفة وCodenames بتجربة واضحة واحترافية وسريعة.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: "لمتكم | منصة ألعاب عربية جماعية",
    template: "%s | لمتكم",
  },
  description: siteDescription,
  keywords: [
    "لمتكم",
    "ألعاب جماعية",
    "ألعاب عربية",
    "ألعاب أسئلة",
    "مسابقات جماعية",
    "جلسات",
    "تجمعات",
    "برا السالفة",
    "codenames",
    "لعبة فئات وأسئلة",
  ],
  referrer: "origin-when-cross-origin",
  category: "games",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon", sizes: "32x32", type: "image/png" },
      { url: "/icon", sizes: "192x192", type: "image/png" },
      { url: "/icon", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    locale: "ar_JO",
    title: "لمتكم | منصة ألعاب عربية جماعية",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "لمتكم | منصة ألعاب عربية جماعية",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#040816",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getViewer();

  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.className} relative min-h-screen overflow-x-hidden text-white`}>
        <SiteBackground />
        <div className="relative z-10 min-h-screen bg-transparent text-white">
          <Navbar initialAuth={viewer} />
          <AppResumeRefresh />
          {children}
        </div>
      </body>
    </html>
  );
}