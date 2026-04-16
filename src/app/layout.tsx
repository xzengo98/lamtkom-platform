import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "../components/layout/navbar";
import AppResumeRefresh from "../components/app/app-resume-refresh";
import { getViewer } from "../lib/auth/viewer";

export const metadata: Metadata = {
  title: {
    default: "لمتكم | منصة ألعاب عربية",
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
  <body className="min-h-screen bg-[linear-gradient(180deg,#020a1a_0%,#030d22_55%,#020814_100%)] text-white">
    <div className="min-h-screen bg-transparent text-white">
      <Navbar initialAuth={viewer} />
      <AppResumeRefresh />
      {children}
    </div>
  </body>
</html>
  );
}