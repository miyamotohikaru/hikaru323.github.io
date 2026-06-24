import { neon, NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

/**
 * Neon クライアントをリクエスト時に遅延生成する。
 * モジュール先頭で neon() を呼ぶとビルド時（DATABASE_URL 未設定）に失敗するため。
 */
export function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}
