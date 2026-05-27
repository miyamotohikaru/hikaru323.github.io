import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creature Vision Lab — 生き物の目で世界を見よう",
  description:
    "写真や動画をアップロードして、100種類の生き物の視覚フィルターで世界を体験しよう！",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&family=Zen+Maru+Gothic:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
