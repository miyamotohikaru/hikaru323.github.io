# こすくまくん 配布サイト

社内の同僚に「こすくまくん（macOS常駐アプリ）」を配るための1ページのサイト。
Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript。

**人に渡すURL: https://desktopkosukumakun.kosukuma.com**

Cloudflare Worker 越しの独自ドメイン。view-source の1行目に こす.くま宣言文が出る。
`kosukumakun.vercel.app` も生きているが、そちらは宣言文が出ない。
仕組みと張り替え手順は `~/99_cloudflare-proxy/README.md`。

```
kosukumakun/
├── mac/      … アプリ本体（Swift）  ← このサイトからは触らない
├── tools/    … アセット抽出スクリプト
└── （ここ）  … 配布サイト
```

## 動かす

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## 配布ZIPの置き場所

ダウンロードボタンは `/download/kosukumakun.zip` を指している。
ビルド済みの `こすくまくん.app` を ZIP にして、この名前で置く。

```bash
cd mac && ./build.sh universal
cd build && zip -r ../../public/download/kosukumakun.zip "こすくまくん.app"
```

ZIP は **コミットする**。Vercel は静的ファイルをリポジトリから配るので、
除外するとダウンロードボタンが 404 になる。
`public/download/.gitkeep` は、ZIPを置くまでフォルダを残すためのもの。

## こすくまくんの絵について

画像ファイルは1枚も置いていない。ページに出てくるこすくまくんは全部 **inline SVG**
で、パスは公式Illustratorデータの抽出結果（`mac/Assets/kosukuma.json`）そのまま。
アプリの中のこすくまくんと同じ形が出る。

元データを更新したら作り直す:

```bash
npm run poses
```

これで次の2つが再生成される（どちらも自動生成なので直接編集しない）。

- `src/lib/poses.ts` … front / side のパスと公式カラー
- `src/app/icon.svg` … ファビコン（シルエット1枚を正方形いっぱいに詰めたもの）

`curled` と `lying` は入れていない。パーツが「クリームの塗り → 黒の輪郭」の順に
何十枚も重なっていて、静止画としてそのまま塗り重ねると輪郭が団子になって読めない
（アプリ側は変形をかけながら描くので成立する）。使いたくなったら、まず
`tools/extract_kosukuma.py` 側の重なり順を直すほうが早い。

## 決めごと

- **こすくまくんに口はない。しゃべらせない。** 吹き出しは全部「心の声」として書く。
- クリーム `#fafad3` / 黒 `#000000` / 深緑のほくろ `#1a251f` はキャラの色なので、
  ダークモードでも変えない。代わりに、こすくまくんが立つ「舞台」だけ常に明るくして
  黒い輪郭が沈まないようにしている（`.stage` / `.mock` / `.sticker`）。
- インストール手順にスクリーンショットは使わない。撮った瞬間にOSのバージョンと
  ズレるので、CSSで描いた模式図にしてある（`src/components/Mocks.tsx`）。
- アニメーションは呼吸とまばたきだけ。`prefers-reduced-motion` で全部止まる。
