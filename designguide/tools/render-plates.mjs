/**
 * 図版80枚を静止画（WebP）に焼き、public/plates/ に置く。
 *
 * なぜ焼くか。
 *   図版は1枚あたりSVGの要素が数百〜千数百個ある。一覧に80枚並べると
 *   HTMLが11MB、SVG要素が4万個になり、初期表示が3秒を超えた（実測）。
 *   一覧では原寸で見ないので、ベクターである必要がない。
 *   詳細ページだけ本物のSVGを出し、一覧は焼いた画像を貼る。
 *
 * 使い方（図版を足したり直したりしたら毎回）:
 *   1. npm run dev を起動しておく
 *   2. node tools/render-plates.mjs            … 無い分だけ焼く
 *      node tools/render-plates.mjs --all      … 全部焼き直す
 *      node tools/render-plates.mjs a,b,c      … 指定したものだけ
 */
import puppeteer from "puppeteer-core";
import { mkdirSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = process.env.PORT ?? "3031";
const OUT = join(process.cwd(), "public/plates");
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const all = args.includes("--all");
const only = args.find((a) => !a.startsWith("--"))?.split(",");

const slugs = readdirSync(join(process.cwd(), "src/plates"))
  .filter((f) => f.endsWith(".tsx") && !f.startsWith("index."))
  .map((f) => f.slice(0, -4))
  .filter((s) => (only ? only.includes(s) : true))
  .filter((s) => all || only || !existsSync(join(OUT, `${s}.webp`)))
  .sort();

if (!slugs.length) {
  console.log("焼くものはありません");
  process.exit(0);
}

const b = await puppeteer.launch({
  executablePath: CHROME,
  args: ["--headless=new", "--hide-scrollbars"],
});
const p = await b.newPage();
/**
 * 焼く寸法は 480x640。
 * 一覧でいちばん大きく出るのは表紙の刷り物で、CSS上おおよそ300px。
 * 高精細画面の2倍でも600px なので、480px あればほぼ足りる。
 * 640x853・品質90で焼いたら1枚あたり平均92KB（網点物は340KB）になり、
 * 80枚では総量が7MBを超えた。表示寸法に合わせて落としている。
 */
await p.setViewport({ width: 360, height: 520, deviceScaleFactor: 1.5 });

let ok = 0;
const failed = [];
for (const slug of slugs) {
  try {
    await p.goto(`http://localhost:${PORT}/dev/plates?only=${slug}&size=320`, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    // フィルタや帯の演出が落ち着くのを待つ
    await new Promise((r) => setTimeout(r, 260));
    // 検分台では data-plate が <figure> 側にあり、説明札まで入ってしまう。
    // 版面だけを撮る
    const el = await p.$(`[data-plate="${slug}"] .plate-frame`);
    if (!el) { failed.push(slug); continue; }
    await el.screenshot({ path: join(OUT, `${slug}.webp`), type: "webp", quality: 80 });
    ok++;
    process.stdout.write(`\r焼いた ${ok}/${slugs.length}  ${slug}`.padEnd(60));
  } catch (e) {
    failed.push(`${slug}(${e.message.slice(0, 40)})`);
  }
}
await b.close();

// 焼いたものの一覧。サーバ側で「画像があるか」を判定するのに使う
const have = readdirSync(OUT).filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5)).sort();
writeFileSync(
  join(process.cwd(), "src/plates/baked.ts"),
  `// 自動生成。手で書き換えない。→ node tools/render-plates.mjs\nexport const BAKED = new Set<string>(${JSON.stringify(have)});\n`,
  "utf8",
);

console.log(`\n焼けた ${ok} 枚 / 手持ち合計 ${have.length} 枚`);
if (failed.length) console.log("失敗:", failed.join(", "));
