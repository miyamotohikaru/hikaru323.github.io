import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "こすくまくん — PCの中に住みつく",
  description:
    "デスクトップのすみっこに住みつく、社内向けのmacOSアプリ。カーソルを目で追ったり、つままれるともちもち伸びたりします。口が無いのでしゃべりません。",
  // 社内配布用なので検索には出さない
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // 明暗どちらのテーマでもブラウザのUIを地の色に合わせる
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6ef" },
    { media: "(prefers-color-scheme: dark)", color: "#141813" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
