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
- `src/data/details.ts` — 本文確定50件のフルテキスト（`vanished_jobs_details_first10.md` 10件 +
  `vanished_jobs_details_batch1_world.md` 40件より転記）。
  未確定101件は summary＋「書きかけ」表示で運用し、確定次第ここに追記する
- `src/data/lineage.ts` — 系譜12チェーンの定義
- `public/jobs/` — こすくまくんイラスト6枚（keisanshu/knocker/leech/iceman/kappan/denwa）。
  画像なしの職業は線画プレースホルダー表示

## 既知のTODO（受け渡しREADMEより）

- `reading`（読み）が全件未記入（ファーストセット10件のみ details.ts に記載。バッチ1の40件は空）
- 101件の本文（body/timeline/trivia）は仮テキスト運用 → 順次 details.ts に追加（次バッチ予定: 047-061 + 062-080）
- バッチ1の※印箇所（1745外科医分離年・1875煙突掃除法・罪食い人の人名など）は一次資料の裏取り推奨
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
