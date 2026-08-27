import type { Metadata, Viewport } from "next";
import "./globals.css";

const TITLE = "こすくまくん — PCの中に住みつく";
const DESC =
  "デスクトップのすみっこに住みつく、社内向けのmacOSアプリ。カーソルを目で追ったり、つままれるともちもち伸びたりします。口が無いのでしゃべりません。";

/// 本番は Cloudflare Worker 越しの独自ドメイン。`.vercel.app` も生きているが、
/// **人に渡すURLはこちらに揃える**（view-source の1行目に宣言文が出るのはこちら側）。
const SITE = "https://desktopkosukumakun.kosukuma.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESC,
  // 社内配布用なので検索には出さない
  robots: { index: false, follow: false },
  // 検索には出さないが、Slack や LINE に貼ったときは中身が分かるようにしておく
  openGraph: {
    title: TITLE,
    description: DESC,
    url: SITE,
    siteName: "こす.くま",
    locale: "ja_JP",
    type: "website",
  },
  twitter: { card: "summary", title: TITLE, description: DESC },
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
