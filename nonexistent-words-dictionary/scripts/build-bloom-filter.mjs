/**
 * NEologd辞書データからBloom filterを構築するスクリプト
 *
 * 使い方:
 *   node scripts/build-bloom-filter.mjs /path/to/neologd/seed/
 *
 * 出力:
 *   src/lib/neologd-bloom.json (Bloom filterのシリアライズデータ)
 */

import fs from "fs";
import readline from "readline";
import path from "path";
import pkg from "bloom-filters";
const { BloomFilter } = pkg;

const SEED_DIR = process.argv[2] || "/tmp/neologd/mecab-ipadic-neologd/seed";
const BASE_DIR = process.argv[3] || "/tmp/mecab-utf8";
const OUTPUT = path.resolve("src/lib/neologd-bloom.json");

// 偽陽性率 0.1% (strict — 存在する言葉を通してしまうリスクを最小化)
const FALSE_POSITIVE_RATE = 0.001;

async function extractWords(csvPath) {
  const words = new Set();
  const input = fs.createReadStream(csvPath);
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  for await (const line of rl) {
    if (!line || line.startsWith("#")) continue;
    // mecab CSV format: 表層形,左文脈ID,右文脈ID,コスト,...
    const comma = line.indexOf(",");
    if (comma > 0) {
      const surface = line.substring(0, comma).trim();
      if (surface.length > 0 && surface.length <= 30) {
        words.add(surface);
      }
    }
  }

  return words;
}

async function main() {
  console.log("NEologd Bloom Filter Builder");
  console.log("============================");
  console.log(`Seed directory: ${SEED_DIR}`);

  const allWords = new Set();

  // 1. ベース辞書（mecab-ipadic）を読み込み
  if (fs.existsSync(BASE_DIR)) {
    const baseCsvFiles = fs.readdirSync(BASE_DIR).filter((f) => f.endsWith(".csv"));
    console.log(`\n[Base dict] Found ${baseCsvFiles.length} CSV files in ${BASE_DIR}`);
    for (const file of baseCsvFiles) {
      const filePath = path.join(BASE_DIR, file);
      const words = await extractWords(filePath);
      for (const w of words) allWords.add(w);
    }
    console.log(`  → Base dict total: ${allWords.size.toLocaleString()} unique words`);
  } else {
    console.log(`\n[Base dict] Not found at ${BASE_DIR}, skipping`);
  }

  // 2. NEologd拡張辞書を読み込み
  const csvFiles = fs.readdirSync(SEED_DIR).filter((f) => f.endsWith(".csv"));
  console.log(`\n[NEologd] Found ${csvFiles.length} CSV files in ${SEED_DIR}`);

  for (const file of csvFiles) {
    const filePath = path.join(SEED_DIR, file);
    console.log(`  Processing: ${file}...`);
    const words = await extractWords(filePath);
    for (const w of words) allWords.add(w);
    console.log(`    → ${words.size} unique words (total: ${allWords.size})`);
  }

  console.log(`\nTotal unique words: ${allWords.size.toLocaleString()}`);

  // Bloom filter構築
  console.log(
    `Building Bloom filter (FP rate: ${FALSE_POSITIVE_RATE * 100}%)...`
  );
  const filter = BloomFilter.create(allWords.size, FALSE_POSITIVE_RATE);

  let count = 0;
  for (const word of allWords) {
    filter.add(word);
    count++;
    if (count % 500000 === 0) {
      console.log(`  Added ${count.toLocaleString()} words...`);
    }
  }

  console.log(`  Added all ${count.toLocaleString()} words`);

  // シリアライズ
  const serialized = filter.saveAsJSON();
  const json = JSON.stringify(serialized);

  fs.writeFileSync(OUTPUT, json);
  const sizeMB = (Buffer.byteLength(json) / 1024 / 1024).toFixed(2);
  console.log(`\nBloom filter saved to: ${OUTPUT}`);
  console.log(`File size: ${sizeMB} MB`);
  console.log(
    `Filter capacity: ${allWords.size.toLocaleString()} items, FP rate: ${FALSE_POSITIVE_RATE * 100}%`
  );
}

main().catch(console.error);
