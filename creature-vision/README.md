# Creature Vision

写真をアップロードして、生き物の視覚フィルターで世界を体験するアプリ。

## シェアURL機能のセットアップ

シェア機能は Neon (Postgres) と Vercel Blob を使います。

### 1. DBテーブルの作成

初回のみ、[Neon SQL Editor](https://console.neon.tech/) で [`db/init.sql`](db/init.sql) の内容を実行して `shares` テーブルを作成してください。

### 2. 必要な環境変数（Vercel に設定）

| 変数 | 用途 |
|---|---|
| `DATABASE_URL` | Neon Postgres 接続文字列 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob への画像アップロード |
| `GEMINI_API_KEY` | 画像拡張 API（既存） |

> シェアURL（`/share/{id}`）のベースURLは、リクエスト元のオリジンから自動判定します。
> 固定したい場合のみ `NEXT_PUBLIC_BASE_URL` を設定してください。

## 開発

```bash
npm install
npm run dev
```
