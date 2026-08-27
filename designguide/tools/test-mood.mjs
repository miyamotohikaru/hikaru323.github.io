/** 気分から探せるかを、実際に押して確かめる */
import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 1200 });
await p.goto("http://localhost:3031/", { waitUntil: "networkidle0", timeout: 90000 });
await p.evaluate(() => document.getElementById("atlas")?.scrollIntoView());
await new Promise((r) => setTimeout(r, 400));

const count = () => p.$$eval("[data-card]", (els) => els.filter((e) => e.dataset.hit !== "0").length);
const names = () => p.$$eval('[data-card][data-hit="1"] .card__ja', (els) => els.slice(0, 6).map((e) => e.textContent));

console.log("初期:", await count(), "件");
const moods = await p.$$(".ctl__mood");
for (const [i, label] of ["サブカル", "レトロ", "静か", "和"].entries()) {
  const btn = await p.$(`.ctl__mood ::-p-text(${label})`).catch(() => null);
  const target = btn ?? (await p.$$(".ctl__mood"))[["サブカル","レトロ","未来っぽい","手仕事","静か","派手","幾何","印刷っぽく","装飾的","かわいい","アプリの画面","前衛","硬派","和"].indexOf(label)];
  await target.click();
  await new Promise((r) => setTimeout(r, 350));
  console.log(`「${label}」→ ${await count()} 件 :`, (await names()).join(" / "));
  await target.click(); // 解除
  await new Promise((r) => setTimeout(r, 250));
}
// 打ち込みでも効くか
await p.type(".ctl__search input", "サブカル");
await new Promise((r) => setTimeout(r, 400));
console.log('打ち込み「サブカル」→', await count(), "件");
await b.close();
