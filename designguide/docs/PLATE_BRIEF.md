# 図版（プレート）制作要項

STYLE ATLAS は「デザインスタイル80種を一目で見比べる図鑑」です。
1スタイルにつき1枚、**そのスタイルで実際に刷ったらこう出る、という一枚の版画**を
SVG で描きます。抽象的な色見本ではありません。**ポスターを1枚デザインしてください。**

読む人は「このスタイルでAIに描かせると、こういう絵になるのか」を、
この1枚だけで理解します。そこが唯一の合格条件です。

---

## 1. 置き場所と形

- ファイル: `src/plates/<slug>.tsx`（slug は `src/data/spine.ts` のもの。1文字も変えない）
- 既定エクスポート1つ。**引数なしの純関数コンポーネント**

```tsx
import { ATLAS, rand } from "@/lib/plate";

const P = "<短い接頭辞>"; // 例: bauhaus → "bh"

export default function Plate() {
  return (
    <svg viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg"
         role="img" aria-label="<日本語スタイル名>様式の図版">
      {/* … */}
    </svg>
  );
}
```

## 2. 絶対に守ること

1. **viewBox は必ず `0 0 600 800`。** width/height は書かない（枠側が持つ）
2. **`<defs>` の id は必ず `` `${P}-…` `` にする。**
   80枚が同一ページに並ぶので、素の id は必ず衝突して、他の図版を壊します。
   `<clipPath> <pattern> <mask> <linearGradient> <filter>` 全部です。
3. **`useState` / `useEffect` / `Math.random()` / `Date` を使わない。**
   サーバで描くので動きません。ゆらぎが要るなら `rand(種)` を使ってください
   （同じ種なら必ず同じ数列を返します）。
4. **画像・外部フォントを読み込まない。** `font-family` は総称名で書く
   （`'Helvetica Neue', Helvetica, Arial, sans-serif` / `Georgia, 'Times New Roman', serif` /
   `'Courier New', ui-monospace, monospace` など）。
5. **`feTurbulence` を自前で書かない。** 共有の `ATLAS.*` を使うこと。
   80枚それぞれが持つと一覧ページの描画が落ちます。
6. **パレットは `src/data/spine.ts` の5色を軸にする。**
   その5色から作った濃淡・中間色は足してよい。まったく別の色相を足さない。
   80枚を並べたときの調和がここで決まっています。

## 3. 共有の道具（`@/lib/plate` と `AtlasDefs`）

**かぶせる側**（板を1枚重ねて使う）
```tsx
<rect width="600" height="800" filter={`url(#${ATLAS.grain})`}
      opacity="0.14" style={{ mixBlendMode: "multiply" }} />
```
- `ATLAS.grain` … 細かい紙の目（上質紙）
- `ATLAS.grainCoarse` … ざら紙・わら半紙。粒が見える
- `ATLAS.fibre` … 横に伸びた繊維。和紙・厚紙

**かける側**（対象の `<g>` に直接）
```tsx
<g filter={`url(#${ATLAS.bleed})`}> … </g>
```
- `ATLAS.bleed` … インクのにじみ。輪郭をわずかに食わせる
- `ATLAS.rough` … 版のかすれ。木版・シルクの荒い輪郭
  **⚠️ 網点を敷いた上にこれをかけない。点が崩れて落書きになります。**

**塗りに使う**
- `ATLAS.halftone` / `ATLAS.halftoneFine` … 網点（45度）
- `ATLAS.scanlines` … 走査線（ブラウン管）

**関数**: `rand(seed)` / `lerp` / `rad` / `onCircle` / `polygon` / `alpha(hex,a)` / `shift(hex,t)`

## 4. 良い図版の条件（ここで落ちます）

- **構図が決まっていること。** 真ん中に丸を1個置いて終わり、は不可。
  版面を分ける線を決め、重心を中央から外し、余白を意図して残す。
- **文字が入っていること。** そのスタイルらしい欧文を最低1つ。
  ただし**版面の絵と喧嘩させない**（初稿で黒帯が文字を切って事故に見えた例あり）。
- **質感があること。** 平らな塗りだけで終わらせない。
  紙の目・網点・かすれ・グラデーション・線の重ねのどれかを必ず入れる。
- **近くで見ても持つこと。** 細部が最低1箇所。小さな図・目盛り・点の列・注記など。
- **そのスタイルでなければ成立しない絵であること。**
  色を変えれば別のスタイルになる、程度の絵は不可。
  そのスタイル固有の**技法**（版ズレ／等角投影／網点／歪み／筆致／格子）を必ず絵の構造に入れる。

## 5. 確認のしかた（必ずやること）

開発サーバは **http://localhost:3031** で動いています（他の人も使うので落とさないこと）。

```bash
cd /Users/miyamotohikaru/11dev_designguide/designguide
node tools/gen-index.mjs                 # 索引を作り直す。ファイルを足したら毎回
node tools/shoot.mjs "/dev/plates?only=<slug>&size=520" <slug> 900 1200 \
     "--el=[data-plate=<slug>] .plate-frame"
# → shots/<slug>.png ができるので、Read ツールで**必ず目で見る**
```

**書いて終わりにしないこと。** 撮って、見て、直す。
最低2回は見直してください。1回目でうまくいくことはまずありません。
自分で見て「これがAAA品質のポスターか？」と厳しく問うこと。
違うと思ったら作り直す。

## 6. 手本

以下の3枚が品質の基準です。**書き始める前に必ず全部読んでください。**
コメントに「何を失敗して、なぜこう直したか」が書いてあります。

- `src/plates/bauhaus.tsx` … 幾何・グリッド・縦組みの文字
- `src/plates/risograph.tsx` … 版の分解・網点・版ズレ・掛け合わせ
- `src/plates/pixel-art.tsx` … 格子・限定色・ディザ・手続きで描く絵

## 7. コメントの書き方

日本語で、**なぜそうしたか**を書く。何をしたかはコードを読めば分かります。
「初稿でこう失敗したので、こう直した」が書いてあると次の人が助かります。
読みやすい所（句点・読点）で改行してください。
