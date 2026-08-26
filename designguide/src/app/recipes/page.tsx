import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Copy from "@/components/Copy";
import Jp from "@/components/Jp";
import { RECIPES } from "@/data/recipes";
import { STYLE_BY_SLUG } from "@/data/styles";
import PlateImage from "@/components/PlateImage";

export const metadata = {
  title: "レシピ",
  description:
    "手持ちの写真を1枚のデザインに変える指示書。比率も色も禁止事項まで書き出してあるので、貼るだけで使えます。",
};

export default function RecipesPage() {
  return (
    <>
      <Header />
      <main className="shell rcp">
        <div className="sec">
          <p className="label">Recipes</p>
          <h1 className="sec__h">自分の写真を、作品に変える。</h1>
          <p className="sec__lead">
            図鑑が「様式から描き起こす」ためのものなら、こちらは「手持ちの写真を作り変える」ためのものです。
            <br />
            画面をどう分けるか、どの色を残すか、何をやってはいけないか。
            <br />
            全部を数字と語で書き出した指示書を8本置いています。
          </p>
        </div>

        <div className="rcp__how">
          <p className="label">使い方</p>
          <ol>
            <li>ChatGPT・Gemini・Claude のいずれかを開き、<b>写真を1枚アップロードする</b></li>
            <li>下のレシピをコピーして、同じメッセージに<b>貼って送る</b></li>
            <li>出てきた絵の直したい所だけを、続けて言葉で伝える</li>
          </ol>
          <p className="rcp__note">
            ※ これらは写真を入力に取るレシピです。写真なしで使いたいときは
            <Link href="/build" className="link">プロンプトを組む</Link>
            のほうが向いています。
          </p>
        </div>

        <div className="rcp__list">
          {RECIPES.map((r) => (
            <article key={r.slug} className="rc" id={r.slug}>
              <div className="rc__head">
                <div className="rc__meta">
                  <span className="rc__no">{r.no}</span>
                  <h2 className="rc__title">{r.title}</h2>
                </div>
                <Copy text={r.body} className="rc__copy" label="レシピをコピー" />
              </div>

              <Jp text={r.lead} className="rc__lead" />

              <div className="rc__facts">
                <div>
                  <p className="label">向いている写真</p>
                  <p>{r.suits}</p>
                </div>
                <div>
                  <p className="label">近い様式</p>
                  <div className="rc__styles">
                    {r.styles.map((s) => {
                      const st = STYLE_BY_SLUG[s];
                      if (!st) return null;
                      return (
                        <Link key={s} href={`/style/${s}`} className="rc__chip">
                          <span className="plate-frame">
                            <PlateImage slug={s} alt="" />
                          </span>
                          {st.ja}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <details className="rc__body">
                <summary>
                  <span>指示書を読む</span>
                  <em>{r.body.split("\n").length} 行</em>
                </summary>
                <pre>{r.body}</pre>
              </details>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
