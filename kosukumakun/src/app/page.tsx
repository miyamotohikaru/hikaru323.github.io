import { Kosukuma } from "@/components/Kosukuma";

/* ───────────────────────────────────────────────────────────
   社内向け 説明ページ。
   読む人は「こすくまくんを知らない同僚」。知りたいのは3つだけ:
     1. これは何か  2. 何ができるか  3. どうやって入れるか
   版面は海外の新聞の一面に寄せてある（生成りの紙・明朝・罫線・段組）。
   ─────────────────────────────────────────────────────────── */

const FEATURES: { label: string; title: string; body: string }[] = [
  {
    label: "Eyes",
    title: "目でカーソルを追う",
    body: "近くにカーソルが来ると、そちらを見ます。目は1ドットしかありませんが、1つ動くだけで見ている方向が伝わります。",
  },
  {
    label: "Touch",
    title: "つまむと もちのように伸びる",
    body: "つかんで持ち上げると縦に伸びます。頭の形は変わらず、体だけが伸びる。放すと落ちて、着地でひと潰れします。",
  },
  {
    label: "Keys",
    title: "打つと キーボードを踏む",
    body: "文字を打つと足元にキーが現れ、打鍵1回につき1回ずつ踏みます。打ちすぎると頭から湯気が出ます。",
  },
  {
    label: "Edge",
    title: "ウィンドウの縁に乗る",
    body: "そっと置くと、いちばん手前のウィンドウの上端や左右の縁にちょこんと乗ります。そのウィンドウを動かすと、ついてきます。",
  },
  {
    label: "Sleep",
    title: "放っておくと 寝る",
    body: "しばらく触らないでいると寝そべって、頭の上に Z が浮かびます。何か操作すると起きます。寝ている間は描画も止まります。",
  },
  {
    label: "Voice",
    title: "ときどき 心の声がもれる",
    body: "こすくまくんに口はありません。だから しゃべりません。思っていることが、思考の雲になって頭の上に出るだけです。",
  },
];

const TIPS = [
  ["パソコン", "⌘⇧4 のあと スペースを押すと ウィンドウだけ撮れる"],
  ["世界", "ハチミツは腐らない。水分が少なくて酸性だから"],
  ["あそび", "図書館は 本を借りなくても居ていい場所"],
  ["ひとこと", "いつも がんばってて えらい"],
];

const STEPS = [
  {
    n: "1",
    title: "ZIPを ダウンロードする",
    body: "このページの「ダウンロード」から受け取ります。大きさは1MBもありません。",
  },
  {
    n: "2",
    title: "解凍して アプリケーションに入れる",
    body: "ZIPをダブルクリックすると「こすくまくん」が出てきます。それを アプリケーション フォルダへ移してください。",
  },
  {
    n: "3",
    title: "1回目は 開けません（正常です）",
    body: "ダブルクリックすると「開けません」と出ます。これは Apple の署名がまだ無いためで、壊れているわけではありません。",
    warn: true,
  },
  {
    n: "4",
    title: "システム設定から 許可する",
    body: "アップルメニュー → システム設定 → プライバシーとセキュリティ を開き、下の方にある「このまま開く」を押します。",
  },
  {
    n: "5",
    title: "もう一度 ダブルクリック",
    body: "メニューバーの右側に こすくまくんが出たら成功です。次からは ふつうに起動します。",
  },
];

export default function Page() {
  return (
    <main className="mx-auto max-w-[1180px] px-5 pb-24">
      {/* ── 題字 ───────────────────────────────────── */}
      <header className="pt-10">
        <div className="flex items-baseline justify-between text-[11px] sans" style={{ color: "var(--ink-60)" }}>
          <span>こす.くま</span>
          <span>デスクトップに住む くま</span>
          <span>Mac 用・無料</span>
        </div>
        <div className="rule-thick mt-2" />
        <h1
          className="text-center leading-[0.9] tracking-tight"
          style={{ fontSize: "clamp(52px, 12vw, 132px)", marginTop: "0.12em" }}
        >
          こすくまくん
        </h1>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] sans" style={{ color: "var(--ink-60)" }}>
          <span>KOSUKUMA-KUN</span>
          <span aria-hidden>·</span>
          <span>いつも そこに いる</span>
        </div>
        <div className="rule-thick mt-3" />
      </header>

      {/* ── リード ─────────────────────────────────── */}
      <section className="mt-8 grid gap-8 md:grid-cols-[1.55fr_1fr]">
        <div>
          <p className="eyebrow">はじめに</p>
          <h2 className="mt-2 text-[30px] leading-[1.25] md:text-[38px]">
            仕事の じゃまを しない、
            <br />
            小さな くまです。
          </h2>
          <p className="drop mt-4 text-[15px] leading-[1.95]" style={{ color: "var(--ink)" }}>
            画面のすみに ちょこんと居て、カーソルを目で追ったり、キーボードを踏んだり、
            ときどき ぽつりと 何かを思ったりします。クリックしても 前面には出てこないので、
            打っている文字が とられることはありません。何も起きていないときは 描画そのものを止めて、
            じっとしています。
          </p>
          <p className="mt-3 text-[15px] leading-[1.95]">
            こすくまくんには <b>口がありません</b>。だから しゃべりません。
            うれしいとき、ねむいとき、おどろいたとき——ぜんぶ 目と からだの かたちで出ます。
          </p>
        </div>

        <aside className="rule-l md:pl-7">
          <div className="flex items-end justify-center pt-2">
            <Kosukuma pose="front" breathe blink className="h-[210px] w-auto" label="こすくまくん" />
          </div>
          <div className="rule mt-5 pt-3">
            <p className="eyebrow">かるさ</p>
            <dl className="mt-2 space-y-1.5 text-[13px] sans">
              {[
                ["アプリの大きさ", "0.9 MB"],
                ["メモリ", "約 30 MB"],
                ["ふだんのCPU", "0.1 %"],
                ["通信", "しない"],
                ["必要な許可", "なし"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt style={{ color: "var(--ink-60)" }}>{k}</dt>
                  <dd className="tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </section>

      {/* ── できること ─────────────────────────────── */}
      <section className="mt-12">
        <div className="rule-thick" />
        <h2 className="mt-3 text-center text-[26px] tracking-wide">できること</h2>
        <div className="rule mt-3" />
        <div className="grid gap-x-8 gap-y-7 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title}>
              <p className="eyebrow">{f.label}</p>
              <h3 className="mt-1.5 text-[19px] leading-snug">{f.title}</h3>
              <p className="mt-2 text-[13.5px] leading-[1.9]" style={{ color: "var(--ink-60)" }}>
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── 豆知識 ─────────────────────────────────── */}
      <section className="mt-12">
        <div className="rule" />
        <div className="grid gap-8 pt-6 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow">ときどき</p>
            <h2 className="mt-1.5 text-[24px] leading-snug">
              豆知識を 教えてくれます
            </h2>
            <p className="mt-3 text-[13.5px] leading-[1.9]" style={{ color: "var(--ink-60)" }}>
              「パソコン」「世界」「あそび」「ひとこと」の4種類を 順番に。
              15〜25分に1回くらい、手が止まっているときだけ出ます。
              打っている最中には ぜったいに出しません。
              こすくまくんを つづけて2回タップすると、その場でも 見られます。
            </p>
          </div>
          <ul className="space-y-3">
            {TIPS.map(([kind, text]) => (
              <li key={text} className="rule pt-3">
                <span className="eyebrow">{kind}</span>
                <p className="mt-1 text-[15px] leading-[1.8]">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 入れかた ───────────────────────────────── */}
      <section className="mt-14">
        <div className="rule-thick" />
        <h2 className="mt-3 text-center text-[26px] tracking-wide">入れかた</h2>
        <p className="mt-1 text-center text-[12px] sans" style={{ color: "var(--ink-60)" }}>
          はじめの1回だけ ひと手間かかります。2回目からは ふつうに開きます
        </p>
        <div className="rule mt-3" />

        <div className="mt-6 flex justify-center">
          <a
            href="/download/kosukumakun.zip"
            className="sans inline-block px-8 py-3 text-[14px] tracking-wider"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            こすくまくんを ダウンロード
          </a>
        </div>

        <ol className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rule pt-3">
              <div className="flex items-baseline gap-3">
                <span
                  className="text-[34px] leading-none tabular-nums"
                  style={{ color: s.warn ? "var(--accent)" : "var(--ink-30)" }}
                >
                  {s.n}
                </span>
                <h3 className="text-[17px] leading-snug">{s.title}</h3>
              </div>
              <p className="mt-2 text-[13.5px] leading-[1.9]" style={{ color: "var(--ink-60)" }}>
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 安心して使うために ─────────────────────── */}
      <section className="mt-14">
        <div className="rule-thick" />
        <h2 className="mt-3 text-center text-[26px] tracking-wide">安心して使うために</h2>
        <div className="rule mt-3" />
        <div className="grid gap-8 pt-6 md:grid-cols-3">
          {[
            {
              t: "キーの中身は 読んでいません",
              b: "使っているのは「最後にキーが押されてから何秒たったか」だけを返す macOS の仕組みです。何のキーを押したかは 原理的に取得できません。だから アクセシビリティの許可も出ません。",
            },
            {
              t: "どこにも 通信しません",
              b: "ネットワークの接続は1本もありません。豆知識も こすくまくんの絵も、すべてアプリの中に入っています。社外に出ていくものは 何もありません。",
            },
            {
              t: "いつでも 止められます",
              b: "メニューバーの こすくまくんから「そっとしておく」で隠せます。「終了」で完全に止まります。常駐を切りたいときも ワンクリックです。",
            },
          ].map((c) => (
            <article key={c.t}>
              <h3 className="text-[17px] leading-snug">{c.t}</h3>
              <p className="mt-2 text-[13.5px] leading-[1.9]" style={{ color: "var(--ink-60)" }}>
                {c.b}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── 奥付 ───────────────────────────────────── */}
      <footer className="mt-16">
        <div className="rule-thick" />
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-[11px] sans" style={{ color: "var(--ink-60)" }}>
          <span>こす.くま</span>
          <div className="flex items-center gap-3">
            <Kosukuma pose="front" silhouette className="h-5 w-auto" />
            <span>macOS 13 以降 / Apple Silicon・Intel 両対応</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
