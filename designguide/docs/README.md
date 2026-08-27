# STYLE ATLAS — 開発メモ

デザインスタイル80種を1枚ずつの図版で見比べ、そのまま画像生成の
プロンプトにできる図鑑。

## 起動

```bash
npm install
npm run dev        # http://localhost:3031
```

## 中身のありか

| 何 | どこ |
|---|---|
| 80種の背骨（名前・年代・出自・分類・5色） | `src/data/spine.ts` ← **唯一の正** |
| 解説とプロンプト部品 | `src/data/entries/<slug>.ts` |
| 図版（SVGで作図） | `src/plates/<slug>.tsx` |
| プロンプトの組み立て | `src/lib/prompt.ts` |
| 写真変換のレシピ | `src/data/recipes.ts` |
| 焼いた図版（一覧用） | `public/plates/<slug>.webp` |

`src/plates/index.ts` `src/data/entries.ts` `src/plates/baked.ts` は自動生成。手で触らない。

## 図版を足す・直したとき（⚠️ 忘れやすい）

```bash
node tools/gen-index.mjs          # 索引を作り直す
node tools/render-plates.mjs      # 焼けていない分を焼く
node tools/render-plates.mjs --all            # 全部焼き直す
node tools/render-plates.mjs bauhaus,riso     # 指定分だけ
```

**焼くのを忘れると、一覧に古い絵が出たまま、あるいは斜線の仮placeholderが出る。**

### なぜ焼くのか

図版は1枚あたりSVGの要素が数百〜千数百個ある。80枚を一覧に並べたとき、
HTMLが **11MB**、SVG要素が **4万個**、初期表示 **1.4秒** になった（実測）。
一覧では原寸で見ないのでベクターである必要がなく、焼いた画像に差し替えたら
**293KB・192ms** になった。詳細ページ `/style/[slug]` だけ本物のSVGを出している。

## 確かめる道具

```bash
node tools/shoot.mjs "/" home 1440 1000            # 頁を撮る
node tools/shoot.mjs "/" dark 1440 1000 --theme=dark
node tools/shoot.mjs "/dev/plates?size=210" all 1600 3000 --full   # 図版を全部並べる
node tools/perf.mjs                                 # 一覧の重さを測る
```

`/dev/plates` は図版の検分台。`?only=a,b,c` と `?size=NN` が使える。

## 制作要項

- 図版: `docs/PLATE_BRIEF.md`
- 解説: `docs/ENTRY_BRIEF.md`

## 公開

- 確認用: https://designguide-001.vercel.app/ （`feat/designguide` に紐付け・push で自動更新）
- Vercel プロジェクト名 `designguide` / scope `kosukuma-dev` / root directory `designguide`
