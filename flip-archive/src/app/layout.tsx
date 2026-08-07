import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  display: "swap",
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "世界のFLIP図鑑 — WORLD FLIP ARCHIVE",
  description:
    "常識をひっくり返した企画・作品・介入・事件を、分野の境界を越えて記録するアーカイブ。何が当たり前で、何をどう配置し直したのかを比較する。",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} ${plexMono.variable} ${notoSansJp.variable}`}
      >
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
