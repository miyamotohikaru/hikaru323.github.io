import Heading from "@/components/retro/Heading";
import Marquee from "@/components/retro/Marquee";
import Counter from "@/components/retro/Counter";
import FlipTable from "@/components/retro/FlipTable";
import NoRightClick from "@/components/retro/NoRightClick";
import { jpDate, NEW_SLUGS, OPENED } from "@/components/retro/util";
import { FLIP_DEFINITION } from "@/data/flips";

const HOME = "https://kosukuma.com/home.html";

/**
 * ふりっぷ一覧。
 * 株式会社こす.くまのホームページの1ページとして組んでいるので、
 * 並びも本物の home.html と同じ順にしてある。
 *
 *   header（ロゴ／ページ名／訪問者カウンター）
 *   marquee（電光掲示板）
 *   cont01_news（最新情報＝新着ふりっぷ）
 *   goods_plane（空の帯。何かが横断していく）
 *   add_page（見出し画像＋本文＝ふりっぷとは）
 *   cont02（表＝ふりっぷ一覧表）
 *   btn（もどるボタン）
 *   footer（無断転載禁止／Copyright）
 */
export default function Page() {
  return (
    <>
      <NoRightClick />

      {/* ── 天 ───────────────────────────────── */}
      <header className="header">
        <p className="sitelogo">
          <a href={HOME}>
            {/* 本物のHPの天と同じロゴ画像。押すと会社のトップへもどる */}
            <img
              src="/hp/ttl.gif"
              alt="株式会社こす.くま"
              width={773}
              height={117}
            />
          </a>
        </p>

        {/*
          ページ名。「ふりっぷ」の4文字は1文字ずつ別の要素にしてある。
          ★あとから1文字ずつひっくり返せるように、
            回す対象は .ttl-c（data-flip-index 付き）にしてある。
        */}
        {/*
          塗りと縁は本物の「FLIP事業について」（heading-flip.png）と同じ組。
          FLIPの話をする見出しはこの色、というのが本物の使い分け。

          ★1文字ずつ別の要素にしてある。字送りをそろえるため「一覧」も1字ずつ。
            ひっくり返す仕掛けの対象は data-flip-index が付いた「ふりっぷ」の4字。
            つまり querySelectorAll("[data-flip-index]") でちょうど4つ取れる。
        */}
        <h1>
          {"ふりっぷ".split("").map((c, i) => (
            <span className="ttl-c" data-flip-index={i} key={i}>
              <Heading variant="cyan" size={80}>
                {c}
              </Heading>
            </span>
          ))}
          {"一覧".split("").map((c) => (
            <span className="ttl-c" key={c}>
              <Heading variant="cyan" size={80}>
                {c}
              </Heading>
            </span>
          ))}
        </h1>

        <p className="visits blink">
          あなたは
          <Counter />
          人目の訪問者です。
        </p>
      </header>

      <main>
        <Marquee />

        {/* ── 最新情報 ─────────────────────────── */}
        <div className="cont01">
          <div className="cont01_news">
            <h2>
              <Heading variant="green" size={40}>
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

        {/* ── 空の帯。本物は飛行機が横断している ───────── */}
        <div className="goods">
          <div className="goods_plane">
            <div className="goods_plane_body">
              <Heading variant="gold" size={64}>
                ふりっぷ
              </Heading>
            </div>
          </div>
        </div>

        <div className="cont02 add_page">
          {/* ── ふりっぷとは ─────────────────────── */}
          <section>
            <div className="inner">
              <div className="common_heading">
                <Heading variant="lime" size={62}>
                  ふりっぷとは
                </Heading>
              </div>

              {/* 立体ベベルの箱。中の4行はこす.くまの言葉なので一字も変えない */}
              <div className="defbox">
                <p className="word">
                  {FLIP_DEFINITION.word}
                  <span className="pos">{FLIP_DEFINITION.pos}</span>
                </p>
                <p className="gloss">{FLIP_DEFINITION.gloss}</p>
                {FLIP_DEFINITION.body.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </section>

          {/* ── 一覧表 ─────────────────────────── */}
          <section>
            <h2 className="listttl">
              <Heading variant="gold" size={66}>
                ふりっぷ一覧表
              </Heading>
            </h2>

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

          <div className="yarrow" aria-hidden>
            <i />
            <em />
          </div>
          <p className="shout blink">ふりっぷは随時ふえていきます！</p>
        </div>

        <div className="btn_back">
          <a href={HOME}>株式会社こす.くま トップページへもどる</a>
        </div>
      </main>

      {/* ── 奥付 ───────────────────────────────── */}
      <footer className="footer">
        <hr />
        <p className="caution">無断転載・コピー等を禁止いたします。</p>
        <span className="copy">Copyright © kosukuma, Inc.</span>
        <p className="updated">
          このページは随時更新しています。
          <br />
          累計訪問者数
          <Counter />
        </p>
      </footer>
    </>
  );
}
