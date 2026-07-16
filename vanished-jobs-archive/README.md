# Vanished Jobs Archive.

「コンピュータ」は、かつて人間の職業だった。——消えた／姿を変えた／消えつつある職業151種を、白いクマ「こすくまくん」と記録する図鑑サイト。

Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS 4（diagnosis-archive / creature-vision と同じスタック）。

## ページ構成

| パス | 内容 |
|---|---|
| `/` | 索引。カード型グリッド＋フィルタ（ステータス3分類／年代＝章／地域8分類／死因7分類／NO.順） |
| `/jobs/[no]` | 詳細。トレカ面＋要約・しごとの中身・道具・きえたわけ・豆ちしき・系譜・同時代のなかま |
| `/timeline` | 年表。7つの章（前近代〜消滅進行中）に沿って中央軸の左右へ配置 |
| `/lineage` | 系譜。12チェーン（通信/計算/時刻/冷却/光/物語/貸与/印刷/移動/接客販売/医療/記録） |
| `/about` | コンセプト・ステータス3分類・死因7分類・統計・クレジット |

## データ

- `src/data/jobs_data.json` — 151職業の全データ（受け渡しパッケージ原本のまま）
- `src/data/jobs.ts` — 型定義＋ステータス/死因/章/地域の分類ヘルパー＋統計（動的計算）
- `src/data/details.ts` — 本文確定149件のフルテキスト（first10 10件 + batch1 40件 + batch2 38件 +
  batch3 40件 + batch4_final 21件より転記）。
  **NO.049 灯台守・NO.057 キーパンチャーの2件のみバッチ原稿に未収録**（「書きかけ」表示。原稿受領次第追記）
- `src/data/lineage.ts` — 系譜12チェーンの定義
- `public/jobs/` — こすくまくんイラスト6枚（keisanshu/knocker/leech/iceman/kappan/denwa）。
  画像なしの職業は線画プレースホルダー表示

## 既知のTODO（受け渡しREADMEより）

- `reading`（読み）が全件未記入（ファーストセット10件のみ details.ts に記載。バッチ分は空）
- NO.049 灯台守・NO.057 キーパンチャーの本文原稿が未受領
- 各バッチの※印箇所（1745外科医分離年・カストリの語源・東証閉場日1999.4.30など）は一次資料の裏取り推奨
- EN切替はUIラベル・分類名・職業英名のみ対応。本文（要約/しごとの中身/豆ちしき等）はJAのまま表示（翻訳未実施）
- 年号・固有事実の一次資料裏取り（公開前）

## 開発

```bash
npm install
npm run dev
```

## デプロイ

Vercel プロジェクト `vanished-jobs-archive`（rootDirectory=`vanished-jobs-archive`）。
運用はモノレポ共通の GitHub Flow（master直push禁止 → branch → PR → プレビュー確認 → マージ）。
確認用URL: https://vanished-jobs-archive-001.vercel.app （`feat/vanished-jobs-archive` へのpushで自動更新）
