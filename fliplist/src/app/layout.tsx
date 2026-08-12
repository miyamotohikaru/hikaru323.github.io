import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  // 会社HPは「トップページ | 株式会社こす.くま」。同じ形にそろえる
  title: "ふりっぷ一覧 | 株式会社こす.くま",
  description:
    "ふりっぷ【名】日常を、ほんの少しひっくり返すきっかけ。こす.くまがつくった小さなあそびと実験のもくじです。",
  openGraph: {
    title: "ふりっぷ一覧 | 株式会社こす.くま",
    description: "日常を、ほんの少しひっくり返すきっかけ。",
    type: "website",
  },
};

/**
 * 会社HPは <meta name="viewport" content="width=1200"> の固定幅。
 * 畳まないのが本物の作法なので、こちらも同じにする。
 * 狭い画面では全体が縮んで入る（会社HPを携帯で見たときと同じ見え方）。
 */
export const viewport: Viewport = {
  width: 1200,
};

/**
 * 前に来たときにえらんだ壁紙を、描く前に貼っておく。
 * これが無いと、いちどクリーム色が出てから色がかわる（ちらつく）。
 * 実際の絵の指定は globals.css の #home[data-fl-bg] にある。
 */
const RESTORE_BG = `try{var v=localStorage.getItem('fl-bg');
if(v==='mint'||v==='sky'||v==='peach'){document.body.dataset.flBg=v}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      {/* id="home" は会社HPと同じ。CSSのセレクタも本物に合わせてある */}
      <body id="home">
        <script dangerouslySetInnerHTML={{ __html: RESTORE_BG }} />
        {children}
      </body>
    </html>
  );
}
