import { Kosukuma } from "@/components/Kosukuma";
import { StepZip, StepApps, StepBlocked, StepAllow, StepMenubar } from "@/components/Diagrams";
import { MenuMock, MENU_ITEMS } from "@/components/MenuGuide";

/* 案2。案1（白地・角丸カード）の「わかりやすさと余白」は保ったまま、
   面の切り分けを 枠ではなく 間と罫で行う。色はこすくまくんの2色だけ。 */

/* できることの絵は、**アプリ本体の描画をそのまま書き出した動く絵**（GIF）。
   図に描き起こすのではなく、実際に画面で起きるのと同じ動きを見せる。
   作り直すときは tools/make_shots.py を走らせる（public/shots/ が丸ごと入れ替わる）。 */
const FEATURES = [
  { s: "eyes",    t: "目でカーソルを追う",         b: "近くにカーソルが来ると、そちらを見ます。" },
  { s: "stretch", t: "つまむと もちのように伸びる", b: "頭の形は変わらず、体だけが伸びます。放すと落ちて弾みます。" },
  { s: "keys",    t: "打つと キーボードを踏む",     b: "足元にキーが出て、打鍵1回につき1回踏みます。打ちすぎると湯気。" },
  { s: "roll",    t: "スクロールで 梅干しを転がす", b: "下へ動かすと右、上へ動かすと左。画面のはしまで行くと、90度まがって壁を登ります。" },
  { s: "edge",    t: "ウィンドウの縁に乗る",       b: "そっと置くと上端や左右の縁に。その窓を動かすとついてきます。" },
  { s: "edgepeek", t: "画面のはしから のぞく",     b: "手が止まると はしへどいて顔だけ出します。タップで4か所を順に、つかむと縁に沿って動きます。" },
  { s: "sleep",   t: "放っておくと 寝る",         b: "寝そべって Z が浮かびます。寝ている間は描画も止まります。" },
  { s: "think",   t: "ときどき 心の声がもれる",    b: "口がないので しゃべりません。豆知識も この形で伝えます。" },
];

/* 豆知識。4種類を順番に回して出す。ここではその内訳と、実際の出方を見せる。 */
const TIP_KINDS = [
  { k: "パソコンの豆知識", n: 41, e: "⌘⇧4 のあと スペースを押すと ウィンドウだけ撮れる" },
  { k: "世界の豆知識",     n: 30, e: "キリンの首の骨の数は 人間と同じ7個" },
  { k: "あそびの豆知識",   n: 30, e: "図書館は 本を借りなくても居ていい場所" },
  { k: "ひとこと",         n: 30, e: "いつも がんばってて えらい" },
];

const STEPS = [
  { d: StepZip,     n: "1", t: "ZIPをダウンロード",       b: "下のボタンから。1MBもありません。" },
  { d: StepApps,    n: "2", t: "アプリケーションに入れる", b: "解凍して出てきた「こすくまくん」を移動します。" },
  { d: StepBlocked, n: "3", t: "1回目は開けません",       b: "「開けません」と出ます。署名がまだ無いだけで、壊れていません。" },
  { d: StepAllow,   n: "4", t: "システム設定で許可",       b: "プライバシーとセキュリティ →「このまま開く」を押します。" },
  { d: StepMenubar, n: "5", t: "もう一度ひらく",           b: "メニューバーに出たら成功。次からは ふつうに開きます。" },
];

/* 「こんなときは これ」。メニューの並び順ではなく、困りごとの側から引けるようにする。
   使い方が伝わらないのは、たいてい「名前は見えているが、いつ押すのか分からない」から。 */
const WHEN = [
  ["じゃまなとき",
   "「画面のはしからのぞく」。画面のふちへどいて顔だけ出すので、作業しているものの前に立ちません。",
   "のぞいている間に こすくまくんをタップすると、上 → 右 → 左 → 下 と4か所を順にまわります。つかむと、その縁に沿ってすべらせられます。"],
  ["見失ったとき",
   "「定位置にもどす」（⌘R）。画面のいちばん下・右のほうへ帰ってきます。",
   "ウィンドウの縁に乗ったまま その窓が閉じたときや、別のデスクトップに残ったときも、これで戻ります。"],
  ["集中したいとき",
   "「かくれてもらう」。姿も動きも消えて、呼び戻すまで出てきません。",
   "そのあいだ描き直しも止まるので、Macが静かになります。もう一度押すと戻ってきます。"],
];

const SPECS = [
  ["1.5 MB", "アプリの大きさ"],
  ["30 MB", "メモリ"],
  ["0.1 %", "ふだんのCPU"],
  ["しない", "通信"],
  ["なし", "必要な許可"],
];

function Download({ label = "ダウンロード" }: { label?: string }) {
  return (
    <a
      href="/download/kosukumakun.zip"
      className="inline-flex items-baseline gap-3 px-8 py-4 text-[15px]"
      style={{ background: "var(--ink)", color: "var(--paper)" }}
    >
      <span>{label}</span>
      <span className="text-[12px] opacity-60">713 KB</span>
    </a>
  );
}

export default function Page() {
  return (
    <main className="mx-auto max-w-[1000px] px-6">
      {/* ヒーロー */}
      <section className="grid items-center gap-10 pt-24 pb-20 md:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="sec-no">FOR macOS · 無料</p>
          <h1 className="mt-5 text-[46px] font-bold leading-[1.12] tracking-tight sm:text-[58px]">
            デスクトップに
            <br />
            こすくまが
            <br />
            すみつきます
          </h1>
          <p className="mt-6 max-w-[420px] text-[15.5px]" style={{ color: "var(--muted)" }}>
            こすくまくんは 画面のすみで、カーソルを目で追ったり、キーボードを踏んだり、
            ときどき ぽつりと 何かを思ったりします。仕事の じゃまは しません。
          </p>
          <div className="mt-9">
            <Download />
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <Kosukuma pose="front" breathe blink className="h-[240px] w-auto" label="こすくまくん" />
        </div>
      </section>

      {/* 数値 */}
      <section className="hair grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-5">
        {SPECS.map(([v, k]) => (
          <div key={k}>
            <div className="text-[24px] font-semibold tabular-nums">{v}</div>
            <div className="mt-0.5 text-[11.5px]" style={{ color: "var(--muted)" }}>{k}</div>
          </div>
        ))}
      </section>

      {/* できること */}
      <section className="hair pt-16 pb-8">
        <p className="sec-no">01</p>
        <h2 className="mt-3 text-[30px] font-bold tracking-tight">できること</h2>
        <p className="mt-2 max-w-[460px] text-[14px]" style={{ color: "var(--muted)" }}>
          こすくまくんに口はありません。うれしさも ねむさも、目と からだで出ます。
        </p>

        <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {FEATURES.map(({ s, t, b }) => (
            <article key={t}>
              <img
                src={`/shots/${s}.gif`}
                alt=""
                width={760}
                height={460}
                className="w-full rounded-lg"
                style={{ border: "1px solid var(--line)", imageRendering: "pixelated" }}
              />
              <h3 className="mt-4 text-[16px] font-semibold leading-snug">{t}</h3>
              <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--muted)" }}>{b}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 豆知識 */}
      <section className="hair mt-16 pt-16 pb-8">
        <p className="sec-no">02</p>
        <h2 className="mt-3 text-[30px] font-bold tracking-tight">ときどき 教えてくれます</h2>
        <p className="mt-2 max-w-[520px] text-[14px]" style={{ color: "var(--muted)" }}>
          4種類を順番に。12〜25分に1回くらい、手が止まっているときだけ出ます。
          打っている最中には出しません。こすくまくんを つづけて2回タップすると、その場でも見られます。
        </p>

        <div className="mt-12 grid items-start gap-x-12 gap-y-10 md:grid-cols-[1fr_1fr]">
          <ul className="space-y-7">
            {TIP_KINDS.map(({ k, n, e }) => (
              <li key={k} className="hair pt-5">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-[15.5px] font-semibold">{k}</h3>
                  <span className="text-[11.5px] tabular-nums" style={{ color: "var(--muted)" }}>
                    {n} 個
                  </span>
                </div>
                <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--muted)" }}>{e}</p>
              </li>
            ))}
          </ul>
          <img
            src="/shots/tips.png"
            alt=""
            width={760}
            height={706}
            className="w-full rounded-lg"
            style={{ border: "1px solid var(--line)", imageRendering: "pixelated" }}
          />
        </div>
      </section>

      {/* 入れかた */}
      <section className="hair mt-16 pt-16 pb-8">
        <p className="sec-no">03</p>
        <h2 className="mt-3 text-[30px] font-bold tracking-tight">入れかた</h2>
        <p className="mt-2 max-w-[460px] text-[14px]" style={{ color: "var(--muted)" }}>
          はじめの1回だけ ひと手間かかります。2回目からは ふつうに開きます。
        </p>

        <ol className="mt-12 space-y-12">
          {STEPS.map(({ d: D, n, t, b }) => (
            <li key={n} className="grid items-center gap-6 sm:grid-cols-[64px_120px_1fr]">
              <div className="bignum">{n}</div>
              <D className="h-[76px] w-[110px]" />
              <div>
                <h3 className="text-[17px] font-semibold">{t}</h3>
                <p className="mt-1.5 max-w-[440px] text-[13.5px]" style={{ color: "var(--muted)" }}>{b}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14">
          <Download label="こすくまくんを むかえる" />
        </div>
      </section>

      {/* 使いかた */}
      <section className="hair mt-16 pt-16 pb-8">
        <p className="sec-no">04</p>
        <h2 className="mt-3 text-[30px] font-bold tracking-tight">呼んだり どいてもらったり</h2>
        <p className="mt-2 max-w-[520px] text-[14px]" style={{ color: "var(--muted)" }}>
          こすくまくんは 自分から前に出てきません。呼ぶのも どいてもらうのも、
          メニューバーの小さいこすくまくんから。ウィンドウは1枚も開きません。
        </p>

        <div className="mt-12 grid items-start gap-x-12 gap-y-10 md:grid-cols-[290px_1fr]">
          <MenuMock />
          <ul className="space-y-6">
            {MENU_ITEMS.map(({ t, k, b }) => (
              <li key={t} className="hair pt-5">
                <div className="flex items-baseline gap-3">
                  <h3 className="text-[15.5px] font-semibold">{t}</h3>
                  {k && (
                    <span className="text-[11.5px] tabular-nums" style={{ color: "var(--muted)" }}>
                      {k}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--muted)" }}>{b}</p>
              </li>
            ))}
          </ul>
        </div>

        <h3 className="mt-16 text-[17px] font-semibold">こんなときは</h3>
        <div className="mt-8 grid gap-x-12 gap-y-9 sm:grid-cols-3">
          {WHEN.map(([t, b, more]) => (
            <article key={t}>
              <h4 className="text-[15.5px] font-semibold">{t}</h4>
              <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>{b}</p>
              <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>{more}</p>
            </article>
          ))}
        </div>

        <div className="mt-14 grid items-start gap-x-12 gap-y-8 md:grid-cols-[1fr_1fr]">
          <div>
            <h3 className="text-[17px] font-semibold">のぞく場所は 4つ</h3>
            <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
              上から さかさま／右のはしから／左のはしから／下から ひょこっと。
              のぞいている間に <b>タップするたび</b> この順に移ります。
              こすくまくんの上で <b>右クリック</b> すると、4つから直接えらべます。
              やめるときは、同じ右クリックの「のぞくのをやめる」か、メニューバーからもう一度。
            </p>
            <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
              手が止まって45秒たつと、自分でも はしへどきます。切るときは設定から。
            </p>
          </div>
          <img
            src="/shots/edgepeek.gif"
            alt=""
            width={760}
            height={460}
            className="w-full rounded-lg"
            style={{ border: "1px solid var(--line)", imageRendering: "pixelated" }}
          />
        </div>
      </section>

      {/* 安心 */}
      <section className="hair mt-16 pt-16 pb-8">
        <p className="sec-no">05</p>
        <h2 className="mt-3 text-[30px] font-bold tracking-tight">安心して使うために</h2>
        <div className="mt-10 grid gap-x-12 gap-y-9 sm:grid-cols-3">
          {[
            ["キーの中身は読んでいません",
             "使うのは「最後にキーが押されてから何秒たったか」だけ。何を押したかは 原理的に取得できません。だから許可も求めません。"],
            ["どこにも通信しません",
             "ネットワーク接続は1本もありません。豆知識も絵も、すべてアプリの中に入っています。"],
            ["いつでも止められます",
             "メニューバーから「かくれてもらう」で隠せます。「終了」で完全に止まります。"],
          ].map(([t, b]) => (
            <article key={t}>
              <h3 className="text-[15.5px] font-semibold">{t}</h3>
              <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>{b}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="hair mt-16 flex items-center justify-between py-8 text-[12px]"
              style={{ color: "var(--muted)" }}>
        <span>こす.くま</span>
        <Kosukuma pose="front" silhouette className="h-5 w-auto" />
        <span>macOS 13 以降 · Intel / Apple Silicon</span>
      </footer>
    </main>
  );
}
