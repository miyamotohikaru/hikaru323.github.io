# Vanished Jobs Archive

消えた仕事をアーカイブする図鑑サイト。

## 構成

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind CSS 4
- `src/app/` 構成（diagnosis-archive / creature-vision と同じスタック）

## 開発

```bash
npm install
npm run dev
```

## デプロイ

Vercel プロジェクト `vanished-jobs-archive`（rootDirectory=`vanished-jobs-archive`）。
運用はモノレポ共通の GitHub Flow（master直push禁止 → branch → PR → プレビュー確認 → マージ）。
