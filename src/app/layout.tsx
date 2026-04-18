import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteBackground from "../components/layout/site-background";
import Navbar from "../components/layout/navbar";
import AppResumeRefresh from "../components/app/app-resume-refresh";
import { getViewer } from "../lib/auth/viewer";

export const metadata: Metadata = {
  title: {
    default: "منصة لمتكم | منصة ألعاب عربية جماعية",
    template: "%s | لمتكم",
  },
  description:
    "منصة تجمع أكثر من لعبة في مكان واحد، بتجربة عربية أنيقة وسهلة الاستخدام.",
  applicationName: "لمتكم",
  keywords: [
    "لمتكم",
    "ألعاب أسئلة",
    "مسابقات",
    "لعبة جماعية",
    "منصة مسابقات",
    "أسئلة وأجوبة",
    "برا السالفة",
    "codenames",
  ],
  openGraph: {
    title: "لمتكم",
    description:
      "منصة تجمع أكثر من لعبة في مكان واحد، بتجربة عربية أنيقة وسهلة الاستخدام.",
    siteName: "لمتكم",
    locale: "ar_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "لمتكم",
    description:
      "منصة تجمع أكثر من لعبة في مكان واحد، بتجربة عربية أنيقة وسهلة الاستخدام.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getViewer();

  return (
  <html lang="ar" dir="rtl">
    <body className="relative min-h-screen overflow-x-hidden text-white">
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