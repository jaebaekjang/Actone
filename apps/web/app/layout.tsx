import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { siteConfig } from "@actone/shared";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

// self-hosted via next/font — no runtime CDN dependency
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — 배우 커뮤니티`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
