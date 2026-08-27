# 解説（エントリ）制作要項

1スタイルにつき1ファイル。図鑑の本文と、プロンプトビルダーが組み立てる
英文の部品を、同じ場所に書きます。

- ファイル: `src/data/entries/<slug>.ts`
- 手本: **`src/data/entries/bauhaus.ts`（必ず先に読む）**
- 型: `src/data/types.ts`
- 名前・年代・出自・分類・パレットは **`src/data/spine.ts` からそのまま写す**（変えない）

```ts
import type { DesignStyle } from "../types";
export const style: DesignStyle = { … };
```

## 各項目の書き方

**tagline** — 20〜32字。「これは何か」を言い切る。説明ではなく一撃で。
  × 「1919年にドイツで生まれたデザイン運動」
  ○ 「丸・三角・四角と、赤青黄だけで世界を組み直す」

**description** — 3〜4文（180〜320字）。
  「どこから来て」「なぜそう見えるのか」を書く。年表の要約にしない。
  読む人が**その様式の考え方**を掴めること。文は句点で改行しやすい長さに。

**traits** — 見た目の決め手を3〜5個。各12〜24字。
  絵を描く人が手を動かせる粒度で。「洗練されている」のような形容は不可。
  「円・三角・正方形の三原型で組む」のように、**やることが分かる**書き方。

**avoid** — これをやると崩れる、を2〜3個。各10〜24字。
  そのスタイルと**混同されやすい別の様式**を打ち消す形が良い。

**prompt.core** — 英語。スタイルの核。3〜8語。`"Bauhaus poster design, geometric abstraction"`
**prompt.texture** — 英語。技法・質感・紙・筆致・粒子
**prompt.palette** — 英語。色の言い方。色名を具体的に挙げる
**prompt.composition** — 英語。構図・レイアウト・視線・余白・文字の置き方
**prompt.negative** — 英語。`no …` を並べる。そのスタイルが崩れる要因を打ち消す

  英語は**画像生成モデルに効く語**で書くこと。文学的な表現ではなく、
  技法名・材質名・撮影用語・印刷用語を使う。
  参考にしている実例（Xのプロンプト職人）は、比率・色名・禁止事項を
  細かく指定することで再現性を出しています。同じ精度で書いてください。

**related** — 近いスタイルの slug を2〜4個。`src/data/spine.ts` にあるものだけ。

## 確認

```bash
cd /Users/miyamotohikaru/11dev_designguide/designguide
node tools/gen-index.mjs
npx tsc --noEmit -p tsconfig.json 2>&1 | head -20   # 型が通ること
```

日本語は読みやすい所（句点・読点）で改行してください。
