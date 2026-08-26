import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import AtlasDefs from "@/components/AtlasDefs";
import "./globals.css";

/**
 * 欧文は3本だけ持つ。和文はシステムに任せる。
 * 和文をWebフォントで積むと、この図鑑では図版80枚と食い合って
 * 初期表示が目に見えて遅くなる。ヒラギノ／游で十分に美しい。
 */
const serif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--f-serif",
});
const sans = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--f-sans",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--f-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://designguide-001.vercel.app"),
  title: {
    default: "STYLE ATLAS｜デザインスタイル80と、それを呼び出すプロンプト",
    template: "%s｜STYLE ATLAS",
  },
  description:
    "バウハウスからピクセルアート、リゾグラフ、Y2Kまで。デザインスタイル80種を一枚の図版で見比べて、そのまま画像生成プロンプトにできる図鑑です。",
  openGraph: {
    title: "STYLE ATLAS｜デザインスタイル80と、それを呼び出すプロンプト",
    description:
      "デザインスタイル80種を一枚の図版で見比べて、そのまま画像生成プロンプトにできる図鑑。",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eeebe4" },
    { media: "(prefers-color-scheme: dark)", color: "#12110e" },
  ],
};

/**
 * 夜／昼の取り出し。描く前に貼らないと、いちど昼の色が出てから入れ替わる。
 * 改行を入れないこと（view-source の1行目に宣言文を出す運用のため）。
 */
const RESTORE_THEME =
  `try{var t=localStorage.getItem('sa-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ja"
      // data-theme を描画前に script で貼るので、サーバの出力とは必ず食い違う。
      // ここだけ差分の警告を止める
      suppressHydrationWarning
      className={`${serif.variable} ${sans.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: RESTORE_THEME }} />
      </head>
      <body>
        <AtlasDefs />
        {children}
      </body>
    </html>
  );
}
