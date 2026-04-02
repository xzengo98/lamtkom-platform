import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/layout/navbar";

export const metadata: Metadata = {
  title: {
    default: "منصة لمتكم - منصة ألعاب عربية",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-950 text-white antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}