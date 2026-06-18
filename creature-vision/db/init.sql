-- shares テーブル: シェアURL機能のメタデータ保存用
-- Neon SQL Editor で一度だけ実行してください。

CREATE TABLE IF NOT EXISTS shares (
  id VARCHAR(12) PRIMARY KEY,
  creature_id VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  original_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  view_count INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_created_at ON shares(created_at DESC);
