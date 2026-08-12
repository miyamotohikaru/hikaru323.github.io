import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // 本物のHPは「トップページ | 株式会社こす.くま」。同じ形にそろえる
  title: "ふりっぷ一覧 | 株式会社こす.くま",
  description:
    "ふりっぷ【名】日常を、ほんの少しひっくり返すきっかけ。こす.くまがつくった小さなあそびと実験の一覧です。",
  openGraph: {
    title: "ふりっぷ一覧 | 株式会社こす.くま",
    description: "日常を、ほんの少しひっくり返すきっかけ。",
    type: "website",
  },
};

/**
 * 本物のHPは <meta name="viewport" content="width=1200"> の固定幅。
 * 畳まないのが本物の作法なので、こちらも同じにする。
 * 狭い画面では全体が縮んで入る（本物のHPを携帯で見たときと同じ見え方）。
 */
export const viewport: Viewport = {
  width: 1200,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      {/* id="home" は本物のHPと同じ。CSSのセレクタも本物に合わせてある */}
      <body id="home">{children}</body>
    </html>
  );
}
