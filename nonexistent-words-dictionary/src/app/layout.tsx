import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "存在しない言葉辞典",
  description: "存在しない言葉だけを受け付ける参加型辞書。あなたの造語で空っぽの辞典を育ててください。",
  openGraph: {
    title: "存在しない言葉辞典",
    description: "存在しない言葉だけを受け付ける参加型辞書。",
    type: "website",
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

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
          href="https://fonts.googleapis.com/css2?family=IM+Fell+English&family=Noto+Sans+JP:wght@400;500&family=Noto+Serif+JP:wght@400;500&family=Shippori+Mincho+B1:wght@500;700&display=swap"
          rel="stylesheet"
        />
        {/* Google Analytics */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        {/* Google AdSense */}
        {adsenseId && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="header-logo-group">
              <span className="header-logo">存在しない言葉辞典</span>
              <span className="header-logo-en">FICTIONARY</span>
            </Link>
            <nav className="header-nav">
              <Link href="/" className="header-link">
                引く
              </Link>
              <Link href="/browse" className="header-link">
                一覧
              </Link>
              <Link href="/ranking" className="header-link">
                ランキング
              </Link>
            </nav>
          </div>
        </header>
        <div className="page-wrapper">
          {children}
        </div>
        <footer className="site-footer">
          <div className="footer-inner">
            <p className="footer-title">
              存在しない言葉辞典 —{" "}
              <span className="footer-en">FICTIONARY</span>
            </p>
            <p className="footer-sub">
              この辞典のすべての言葉は利用者によって創作されたものです
            </p>
            <nav className="footer-nav">
              <Link href="/about">このサイトについて</Link>
              <Link href="/privacy">プライバシーポリシー</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
