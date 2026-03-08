import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeenJeem Platform",
  description: "Arabic quiz gaming platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}