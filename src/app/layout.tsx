import AppResumeRefresh from "../components/app/app-resume-refresh";
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "../components/layout/navbar";
import { getViewer } from "../lib/auth/viewer";

export const metadata: Metadata = {
  title: "لمتكم",
  description: "منصة ألعاب جماعية للجلسات والتجمعات",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const viewer = await getViewer();

  return (
    <html lang="ar" dir="rtl">
      <body>
  <AppResumeRefresh />
  <Navbar initialAuth={viewer} />
  {children}
</body>
    </html>
  );
}