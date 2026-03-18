import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "存在しない言葉辞典",
  description: "存在しない言葉だけを受け付ける辞書。造語を入力すると、辞書的な体裁で定義・語源・例文を創作します。",
  openGraph: {
    title: "存在しない言葉辞典",
    description: "存在しない言葉だけを受け付ける辞書。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Noto+Serif+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="header-logo">
              存在しない言葉辞典
            </Link>
            <nav className="header-nav">
              <Link href="/gojuon" className="header-link">
                五十音一覧
              </Link>
            </nav>
          </div>
        </header>
        <div className="page-wrapper">
          {children}
        </div>
        <footer className="site-footer">
          <p>存在しない言葉辞典 — 「検索する」行為が「創作する」行為に変わる辞書</p>
        </footer>
      </body>
    </html>
  );
}
