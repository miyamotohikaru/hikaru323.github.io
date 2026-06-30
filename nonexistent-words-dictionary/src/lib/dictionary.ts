/**
 * NEologd辞書ベースのBloom filterによる日本語存在チェック
 * 516万語をカバー（mecab-ipadic-NEologd全エントリ）
 * 偽陽性率 0.1% — 存在しない言葉を「存在する」と誤判定するリスクは極小
 */

import fs from "fs";
import path from "path";

// bloom-filters は CommonJS モジュール
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { BloomFilter } = require("bloom-filters");

/** カタカナ → ひらがな変換 */
function toHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

/** ひらがな → カタカナ変換 */
function toKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

export interface DictionaryCheckResult {
  exists: boolean;
  source?: "neologd" | "local";
}

// Bloom filterのシングルトン（遅延ロード）。
// 13MBのJSONを同期readするとイベントループをブロックするため、非同期read＋
// ロード中Promiseを共有して二重ロードを防ぐ（初回のみ実体ロード、以降は再利用）。
let bloomFilter: InstanceType<typeof BloomFilter> | null = null;
let bloomLoadFailed = false;
let bloomLoadPromise: Promise<InstanceType<typeof BloomFilter> | null> | null = null;

function getBloomFilter(): Promise<InstanceType<typeof BloomFilter> | null> {
  if (bloomFilter) return Promise.resolve(bloomFilter);
  if (bloomLoadFailed) return Promise.resolve(null);
  if (bloomLoadPromise) return bloomLoadPromise;

  bloomLoadPromise = (async () => {
    try {
      const bloomPath = path.join(process.cwd(), "src/lib/neologd-bloom.json");
      const raw = await fs.promises.readFile(bloomPath, "utf-8");
      const data = JSON.parse(raw);
      bloomFilter = BloomFilter.fromJSON(data);
      console.log("[Dictionary] NEologd Bloom filter loaded (5.16M words)");
      return bloomFilter;
    } catch (err) {
      console.warn("[Dictionary] Failed to load Bloom filter, falling back to basic set:", err);
      bloomLoadFailed = true;
      return null;
    } finally {
      bloomLoadPromise = null;
    }
  })();
  return bloomLoadPromise;
}

// フォールバック用の基本語セット（Bloom filterが読めない場合）
const BASIC_WORDS = new Set([
  "人", "人間", "男", "女", "子供", "大人", "友達", "家族",
  "日本", "世界", "東京", "大阪", "京都",
  "家", "学校", "病院", "駅", "公園",
  "山", "川", "海", "空", "太陽", "月", "星",
  "犬", "猫", "鳥", "花", "木",
  "食べる", "飲む", "見る", "聞く", "話す", "読む", "書く",
  "する", "なる", "ある", "いる", "行く", "来る",
  "大きい", "小さい", "良い", "悪い", "新しい", "古い",
  "ありがとう", "おはよう", "こんにちは", "さようなら",
]);

/**
 * NEologd辞書チェック（Bloom filter, O(1)）
 * 入力語・ひらがな変換・カタカナ変換の3パターンで照合
 */
export async function existsInLocalDictionary(word: string): Promise<DictionaryCheckResult> {
  const filter = await getBloomFilter();

  if (filter) {
    // Bloom filterで高速チェック
    if (filter.has(word)) return { exists: true, source: "neologd" };
    const hiragana = toHiragana(word);
    const katakana = toKatakana(word);
    if (hiragana !== word && filter.has(hiragana)) return { exists: true, source: "neologd" };
    if (katakana !== word && filter.has(katakana)) return { exists: true, source: "neologd" };
    return { exists: false };
  }

  // フォールバック: 基本語セット
  if (BASIC_WORDS.has(word)) return { exists: true, source: "local" };
  const hiragana = toHiragana(word);
  const katakana = toKatakana(word);
  if (BASIC_WORDS.has(hiragana)) return { exists: true, source: "local" };
  if (BASIC_WORDS.has(katakana)) return { exists: true, source: "local" };
  return { exists: false };
}
