-- shares テーブル: シェアURL機能のメタデータ保存用
-- Neon SQL Editor で一度だけ実行してください。

CREATE TABLE IF NOT EXISTS shares (
  id VARCHAR(12) PRIMARY KEY,
  creature_id VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,        -- OGP用の合成画像（左右並び）
  creature_url TEXT,              -- 長押し切り替え用: 生き物のめ
  human_url TEXT,                 -- 長押し切り替え用: 人間のめ
  original_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  view_count INT DEFAULT 0
);

-- 既存テーブルに後付けする場合（init.sql実行済み環境向け）:
ALTER TABLE shares ADD COLUMN IF NOT EXISTS creature_url TEXT;
ALTER TABLE shares ADD COLUMN IF NOT EXISTS human_url TEXT;

CREATE INDEX IF NOT EXISTS idx_created_at ON shares(created_at DESC);
