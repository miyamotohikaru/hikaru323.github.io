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
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700;800&family=Noto+Serif+JP:wght@400;500;600;700&display=swap"
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
            <Link href="/" className="header-logo">
              存在しない言葉辞典
            </Link>
            <nav className="header-nav">
              <Link href="/browse" className="header-link">
                五十音一覧
              </Link>
              <Link href="/ranking" className="header-link">
                ランキング
              </Link>
              <Link href="/about" className="header-link">
                about
              </Link>
            </nav>
          </div>
        </header>
        <div className="page-wrapper">
          {children}
        </div>
        <footer className="site-footer">
          <div className="footer-inner">
            <p className="footer-tagline">存在しない言葉辞典 — 空っぽの辞典を、みんなで育てる</p>
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
