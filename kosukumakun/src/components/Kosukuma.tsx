import { POSES, type PoseName } from "@/lib/poses";

type Props = {
  pose?: PoseName;
  className?: string;
  /** 読み上げ用の説明。省略すると装飾扱い（aria-hidden）になる */
  label?: string;
  /** 呼吸させる */
  breathe?: boolean;
  /** まばたきさせる */
  blink?: boolean;
  /** 左右反転 */
  flip?: boolean;
  /** 輪郭だけを currentColor で塗る。メニューバーのアイコンと同じ見え方 */
  silhouette?: boolean;
};

/** アイコンのときに穴を何倍にするか。原寸のままだと小さすぎて消える。 */
const EYE_GROW = 1.85;
const NOSE_GROW = 2.6;

/**
 * パスを、それ自身の中心のまわりに拡大する。
 *
 * 抽出したパスは「M x y C x y x y x y L x y Z」の形で、
 * 数値は必ず x, y の順に並ぶ（scripts/build-poses.mjs がそう出している）。
 * だから数を順に読んで、偶数番目をx・奇数番目をyとして動かせば足りる。
 * SVGの transform ではなく数値を書き換えるのは、
 * evenodd で穴にするには **同じ1本の d** に入っていないといけないから。
 */
function growPath(d: string, k: number): string {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const xs = nums.filter((_, i) => i % 2 === 0);
  const ys = nums.filter((_, i) => i % 2 === 1);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  let i = 0;
  return d.replace(/-?\d+(?:\.\d+)?/g, (m) => {
    const c = i++ % 2 === 0 ? cx : cy;
    return (c + (Number(m) - c) * k).toFixed(2);
  });
}

/**
 * こすくまくんを inline SVG で描く。
 *
 * 画像ファイルは1枚も置かない。パスは公式Illustratorデータの抽出結果
 * （mac/Assets/kosukuma.json → src/lib/poses.ts）をそのまま流し込んでいるので、
 * アプリの中のこすくまくんと1ドットも違わない。
 *
 * 塗りの色はJSONに入っている値で固定する。テーマで色を変えないのは、
 * クリーム(#fafad3)も黒も深緑のほくろも「こすくまくんの色」だから。
 */
export function Kosukuma({
  pose = "front",
  className,
  label,
  breathe = false,
  blink = false,
  flip = false,
  silhouette = false,
}: Props) {
  const p = POSES[pose];

  // メニューバーのアイコンはアプリ側も silhouette パスだけを塗っている（AppDelegate と同じ）。
  // 輪郭パーツを持たないポーズでは普通に全部描く
  const outline = p.parts.filter((part) => part.id === "silhouette");
  const mono = silhouette && outline.length > 0;

  // **べた塗りでも 目と鼻は抜く。** 全部埋めると のっぺりした熊の形になって、
  // こすくまくんに見えない。目と鼻のパスを同じ1本の d につないで
  // `fill-rule="evenodd"` にすると、内側の輪が穴になって地の色が出る
  // （マスクを使うと id が要るので、同じ絵を何度も置けなくなる）。
  //
  // **そのまま抜いても見えない。** 目は身長の5.1%、鼻は2.2%しかないので、
  // フッターの20pxだと目が1px・鼻は0.4pxになって消える。
  // アイコンのときだけ、穴をそれぞれの中心のまわりに大きくする
  // （文字の級数を落とすと画数を減らすのと同じ、小さいとき用の作り分け）。
  const holes = mono
    ? p.parts.filter((part) => part.id === "nose" || part.id.startsWith("eye"))
    : [];
  const monoPath = mono
    ? [
        outline[0].d,
        ...holes.map((h) => growPath(h.d, h.id === "nose" ? NOSE_GROW : EYE_GROW)),
      ].join(" ")
    : "";

  const parts = mono ? outline : p.parts;

  return (
    <svg
      viewBox={p.viewBox}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      {label ? <title>{label}</title> : null}
      <g className={breathe ? "kosu-breathe" : undefined}>
        {mono ? (
          <path d={monoPath} fill="currentColor" fillRule="evenodd" />
        ) : (
          parts.map((part) => (
            <path
              key={part.id}
              d={part.d}
              fill={part.fill}
              className={
                blink && part.id.startsWith("eye") ? "kosu-blink" : undefined
              }
            />
          ))
        )}
      </g>
    </svg>
  );
}

/**
 * こすくまくんと足元の影。影の濃さ(10%)と横幅(身長の約6割)は
 * アプリの PetView が描いている影と同じ比率にしてある。
 */
export function KosukumaWithShadow({
  className,
  ...rest
}: Props & { className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        aria-hidden
        className="absolute bottom-[-1.5%] left-1/2 h-[6%] w-[82%] -translate-x-1/2 rounded-[50%] bg-black/10 blur-[2px]"
      />
      <Kosukuma {...rest} className="relative h-full w-full" />
    </div>
  );
}
