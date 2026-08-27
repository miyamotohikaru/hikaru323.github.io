/**
 * 80件の見出し（tagline）が、どの幅でも変な所で折れていないかを見る。
 * 助詞や小書きの字が行頭に来ていないか、行数がいくつになるか。
 */
import puppeteer from "puppeteer-core";
import { readdirSync } from "node:fs";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const slugs = readdirSync("src/data/entries").filter((f) => f.endsWith(".ts")).map((f) => f.slice(0, -3));
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars"] });
const p = await b.newPage();
const HEAD = "がのをにはでともやへ。、」』）】ゃゅょっぁぃぅぇぉー";

for (const w of [390, 900, 1440]) {
  await p.setViewport({ width: w, height: 1100 });
  const bad = [];
  let maxLines = 0;
  for (const slug of slugs) {
    await p.goto(`http://localhost:3031/style/${slug}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 80));
    const r = await p.evaluate(() => {
      const el = document.querySelector(".sty__tag");
      if (!el) return null;
      const walk = (n, acc) => { for (const c of n.childNodes) {
        if (c.nodeType === 3) acc.push(c); else if (c.nodeType === 1) walk(c, acc); } return acc; };
      const lines = [];
      for (const tn of walk(el, [])) {
        const t = tn.textContent; const rg = document.createRange();
        let cur = "", lt = null;
        for (let i = 0; i < t.length; i++) {
          rg.setStart(tn, i); rg.setEnd(tn, i + 1);
          const rc = rg.getBoundingClientRect();
          if (rc.width === 0 && rc.height === 0) { cur += t[i]; continue; }
          const top = Math.round(rc.top);
          if (lt !== null && Math.abs(top - lt) > 3) { lines.push(cur); cur = ""; }
          cur += t[i]; lt = top;
        }
        if (cur) lines.push(cur);
      }
      return lines.map((x) => x.trim()).filter(Boolean);
    });
    if (!r) continue;
    maxLines = Math.max(maxLines, r.length);
    for (let i = 1; i < r.length; i++) {
      if (HEAD.includes(r[i][0])) bad.push(`${slug}: 「${r[i - 1]}／${r[i]}」`);
    }
  }
  console.log(`${String(w).padStart(4)}px  行頭に助詞が来た見出し ${bad.length} 件 / 最大 ${maxLines} 行`);
  bad.slice(0, 8).forEach((x) => console.log("   ▲ " + x));
}
await b.close();
