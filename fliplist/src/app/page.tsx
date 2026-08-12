import Heading from "@/components/retro/Heading";
import Marquee from "@/components/retro/Marquee";
import Counter from "@/components/retro/Counter";
import FlipTable from "@/components/retro/FlipTable";
import NoRightClick from "@/components/retro/NoRightClick";
import Tricks from "@/components/retro/Tricks";
import { jpDate, NEW_SLUGS, OPENED } from "@/components/retro/util";
import { FLIP_DEFINITION } from "@/data/flips";

const HOME = "https://kosukuma.com/home.html";
const CONTACT = "https://kosukuma.com/contact/";

/**
 * ふりっぷ一覧。
 * 株式会社こす.くまのホームページの1ページとして組んでいるので、
 * 並びも中身も本物の home.html をそのまま写している。
 *
 *   header      h1にロゴ（ttl.gif を等倍）＋点滅する訪問者カウンター1行。それだけ
 *   pagettl     ページ名。本物の下位ページ（/contact/）と同じで本文の頭に中央で置く
 *   marquee     電光掲示板
 *   cont01_news 最新情報＝新着ふりっぷ
 *   goods       空の帯。本物と同じで帯の中身は飛行機だけ（文字は入れない）
 *   cont02      add_page の節（節見出しは .inner の左端）＋一覧表
 *   btn_contact 本物の同じ位置にある紫の丸ボタン
 *   footer      無断転載の1行と Copyright の1行だけ
 */
export default function Page() {
  return (
    <>
      <NoRightClick />
      {/*
        隠してある仕掛け3つ。どれも「ひっくり返す」で通してある。
        ページ名を1字ずつ押す／flip と打つ／電光掲示板を掴んで引っぱる。
        版面には何も出さない（この部品は何も描かない）。
      */}
      <Tricks />

      {/* ── 天 ───────────────────────────────────
          本物の home.html の天はこの2つだけ。
            <h1><img ttl.gif></h1>
            <p class="blink">あなたは <img 訪問者数> 人目の訪問者です。</p>
          ロゴは幅を指定せず 773×117 の等倍で置く。ここを縮めると
          くまの頭が縦長になって、それだけで作り物に見える。 */}
      <header className="header">
        <h1>
          <a href={HOME}>
            <img
              src="/hp/ttl.gif"
              alt="株式会社こす.くま"
              width={773}
              height={117}
            />
          </a>
        </h1>
        <p className="blink">
          あなたは
          <Counter />
          人目の訪問者です。
        </p>
      </header>

      <main>
        {/*
          ページ名。本物の下位ページ（/contact/）は本文の頭に中央でページ名を置くので、
          同じ役どころに同じ置き方でならべる。塗りは heading-flip.png と同じ組
          （FLIPの話をする見出しはこの色、というのが本物の使い分け）。

          ★1文字ずつ別の要素にしてある。字送りをそろえるため「一覧」も1字ずつ。
            ひっくり返す仕掛けの対象は data-flip-index が付いた「ふりっぷ」の4字。
            つまり querySelectorAll("[data-flip-index]") でちょうど4つ取れる。
        */}
        <h2 className="pagettl">
          {"ふりっぷ".split("").map((c, i) => (
            <span className="ttl-c" data-flip-index={i} key={i}>
              <Heading variant="cyan" size={84}>
                {c}
              </Heading>
            </span>
          ))}
          {"一覧".split("").map((c) => (
            <span className="ttl-c" key={c}>
              <Heading variant="cyan" size={84}>
                {c}
              </Heading>
            </span>
          ))}
        </h2>

        <Marquee />

        {/* ── 最新情報 ─────────────────────────── */}
        <div className="cont01">
          <div className="cont01_news">
            <h2>
              <Heading variant="green" size={42}>
                新着ふりっぷ
              </Heading>
            </h2>
            <ul>
              {OPENED.slice(0, 3).map((f) => (
                <li key={f.slug}>
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    {jpDate(f.date)}　{f.title}
                    {NEW_SLUGS.includes(f.slug) ? (
                      <span className="new">
                        <img
                          src="/hp/new.gif"
                          alt="new"
                          width={29}
                          height={17}
                        />
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
              <li>
                ふりっぷは随時ふえていきます。できたらここに書いていきます。
              </li>
            </ul>
          </div>
        </div>

        {/* ── 空の帯 ───────────────────────────
            本物と同じ組み。帯の中身は飛行機のGIF1枚だけで、文字は乗せない。
            padding 80px＋中身135px＝295px。帯がタイル(267px)より高いので、
            継ぎ目が横に1本出る。その継ぎ目が本物の顔なので、詰めない。 */}
        <div className="goods">
          <div className="goods_plane">
            <div className="goods_plane_body">
              <img src="/hp/img_plane.gif" alt="" width={600} height={338} />
            </div>
          </div>
        </div>

        <div className="cont02 add_page">
          {/* ── ふりっぷとは ─────────────────────── */}
          <section>
            <div className="inner">
              <div className="common_heading">
                <Heading variant="lime" size={87}>
                  ふりっぷとは
                </Heading>
              </div>

              {/* 本物の節の中身は .common_text の見出し1行＋段落。
                  箱で囲ったり立体の額縁を描いたりはしない。
                  中の4行はこす.くまの言葉なので一字も変えない */}
              <div className="common_text">
                <h3 className="common_title">
                  {FLIP_DEFINITION.word}
                  <span className="pos">{FLIP_DEFINITION.pos}</span>
                </h3>
                <p className="gloss">{FLIP_DEFINITION.gloss}</p>
                {FLIP_DEFINITION.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </section>

          {/* ── 一覧表 ─────────────────────────── */}
          <section>
            <div className="inner">
              <div className="common_heading">
                <Heading variant="gold" size={87}>
                  ふりっぷ一覧表
                </Heading>
              </div>
            </div>

            {/* 表と、その前後の注記。本物の会社概要の表と同じで800pxの中央寄せ。
                注記も同じ幅にそろえてあるので、左端が表とぴったり合う */}
            <p className="tablenote">
              ※上から公開順にならべています。番号は随時ふえていきます。
            </p>

            <FlipTable />

            <p className="tablefoot">
              ※「準備中」のふりっぷは、まだできていません。公開までしばらくお待ちください。
              <br />
              ※行き先のないふりっぷは押せません。
            </p>
          </section>

          {/* 巨大な黄色い矢印。本物の事業モデル図（business-img.png）の矢印と同じで、
              縁は描かず、右下にやわらかい影だけを落とす */}
          <div className="yarrow" aria-hidden>
            <i />
          </div>
        </div>

        {/* 本物の home.html はここに紫の丸ボタンが1つあるだけ */}
        <div className="btn_contact">
          <a href={CONTACT}>
            <img
              src="/hp/btn_contact.gif"
              alt="お問い合わせ"
              width={100}
              height={119}
            />
          </a>
        </div>
        <p className="backlink">
          <a href={HOME}>株式会社こす.くま トップページへもどる</a>
        </p>
      </main>

      {/* ── 奥付 ───────────────────────────────
          本物の奥付は2行だけ。罫線も更新日も下の余白も無い */}
      <footer className="footer">
        <p className="caution">無断転載・コピー等を禁止いたします。</p>
        <span className="copy">Copyright © kosukuma, Inc.</span>
      </footer>
    </>
  );
}
