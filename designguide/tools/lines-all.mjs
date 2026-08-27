/**
 * 詳細ページ80件を、携帯幅とパソコン幅の両方で総点検する。
 * 見出し（tagline）と本文（description）は80件それぞれ長さが違うので、
 * 数件の抜き取りでは漏れる。
 */
import puppeteer from "puppeteer-core";
import { readdirSync } from "node:fs";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const slugs = readdirSync("src/data/entries").filter((f) => f.endsWith(".ts")).map((f) => f.slice(0, -3));
const WIDTHS = [390, 900, 1440];

const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars"] });
const p = await b.newPage();

const scan = () => p.evaluate(() => {
  const hasJa = (s) => /[ぁ-んァ-ヶ一-龥]/.test(s);
  const nodes = [];
  const walk = (el) => {
    for (const c of el.childNodes) {
      if (c.nodeType === 3 && hasJa(c.textContent) && c.textContent.trim().length > 6) {
        const par = c.parentElement;
        if (par && !par.closest("svg") && !par.closest("pre") && !par.closest("code")
            && getComputedStyle(par).display !== "none") nodes.push(c);
      } else if (c.nodeType === 1) walk(c);
    }
  };
  walk(document.body);
  const CLOSERS = "。、）」』】〉》・ー…！？：；";
  const bad = [];
  for (const n of nodes) {
    const t = n.textContent;
    const r = document.createRange();
    const lines = []; let cur = ""; let lastTop = null;
    for (let i = 0; i < t.length; i++) {
      r.setStart(n, i); r.setEnd(n, i + 1);
      const rc = r.getBoundingClientRect();
      if (rc.width === 0 && rc.height === 0) { cur += t[i]; continue; }
      const top = Math.round(rc.top);
      if (lastTop !== null && Math.abs(top - lastTop) > 3) { lines.push(cur); cur = ""; }
      cur += t[i]; lastTop = top;
    }
    if (cur) lines.push(cur);
    for (let i = 0; i < lines.length - 1; i++) {
      const l = lines[i].trim();
      if (l && !CLOSERS.includes(l[l.length - 1])) {
        bad.push(`${(n.parentElement.className || n.parentElement.tagName).toString().split(" ")[0]}｜${l}`);
      }
    }
  }
  return bad;
});

for (const w of WIDTHS) {
  await p.setViewport({ width: w, height: 1100 });
  let n = 0;
  const hits = [];
  for (const slug of slugs) {
    await p.goto(`http://localhost:3031/style/${slug}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 90));
    const bad = await scan();
    if (bad.length) { n += bad.length; hits.push(`${slug}: ${bad.join(" / ")}`); }
  }
  console.log(`\n===== ${w}px  詳細ページ80件 → 割れ ${n} 箇所 =====`);
  hits.slice(0, 25).forEach((h) => console.log("  ▲ " + h));
  if (hits.length > 25) console.log(`  … ほか ${hits.length - 25} 件`);
}
await b.close();
