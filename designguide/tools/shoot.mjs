/**
 * 見た目を確かめる撮影道具。
 *   node tools/shoot.mjs <パス> <出力名> [幅] [高さ] [--full] [--el=セレクタ]
 * 例:
 *   node tools/shoot.mjs /dev/plates?only=bauhaus bauhaus 900 1200 --el=[data-plate=bauhaus]
 */
import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [path = "/", name = "shot", w = "1440", h = "1000", ...rest] = process.argv.slice(2);
const full = rest.includes("--full");
const el = rest.find((a) => a.startsWith("--el="))?.slice(5);
const theme = rest.find((a) => a.startsWith("--theme="))?.slice(8);
const port = process.env.PORT ?? "3031";

const b = await puppeteer.launch({
  executablePath: CHROME,
  args: ["--headless=new", "--force-device-scale-factor=2", "--hide-scrollbars"],
});
const p = await b.newPage();
await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 2 });
await p.goto(`http://localhost:${port}${path}`, { waitUntil: "networkidle0", timeout: 60000 });
if (theme) {
  await p.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
}
await new Promise((r) => setTimeout(r, 700));
const target = el ? await p.$(el) : p;
if (!target) { console.error("要素が見つからない:", el); await b.close(); process.exit(1); }
await target.screenshot({ path: `shots/${name}.png`, fullPage: el ? undefined : full });
console.log(`shots/${name}.png`);
await b.close();
