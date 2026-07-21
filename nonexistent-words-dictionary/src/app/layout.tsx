import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import ClientProviders from "@/components/ClientProviders";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileScrollConverter from "@/components/MobileScrollConverter";
import { EASTER_EGG_HTML } from "./easterEgg";

export const metadata: Metadata = {
  title: "存在しない言葉辞典",
  description: "存在しない言葉だけを受け付ける参加型辞書。あなたの造語で空っぽの辞典を育ててください。",
  openGraph: {
    title: "存在しない言葉辞典",
    description: "存在しない言葉だけを受け付ける参加型辞書。",
    type: "website",
  },
};

// ノッチ/ホームインジケータ領域に env(safe-area-inset-*) が効くよう viewport-fit:cover を指定
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        {adsenseId && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        {/* view-source イースターエッグ: こす.くまの宣言文を先頭付近にコメントで出す */}
        <div style={{ display: "none" }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: EASTER_EGG_HTML }} />
        <ClientProviders>
          <Header />
          <div className="page-wrapper">
            {children}
          </div>
          <Footer />
          <MobileScrollConverter />
        </ClientProviders>
      </body>
    </html>
  );
}
