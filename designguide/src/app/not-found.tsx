import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = { title: "見つかりません" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="shell nf">
        <p className="label">404</p>
        <h1 className="nf__h">この頁は、まだ刷られていません。</h1>
        <p className="nf__p">
          お探しのものは、図鑑の80枚のどれかかもしれません。
          <br />
          一覧から探してみてください。
        </p>
        <div className="hero__acts">
          <Link className="btn btn--fill" href="/">図鑑を見る<em>Atlas</em></Link>
          <Link className="btn" href="/build">プロンプトを組む<em>Builder</em></Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
