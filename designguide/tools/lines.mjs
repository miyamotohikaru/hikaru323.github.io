/**
 * 和文が「どこで行が割れているか」を、実際の描画から取り出す。
 *
 * 目で見て気づけるのは大きい文字だけで、小さい注記の割れは見落とす。
 * Range の矩形から視覚的な行を復元して、行末の1文字を見る。
 * 行末が読点・句点・閉じ括弧でなければ「語の途中で割れている」候補。
 *
 *   node tools/lines.mjs <パス> <幅>
 */
import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [path = "/", width = "1440"] = process.argv.slice(2);

const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars"] });
const p = await b.newPage();
await p.setViewport({ width: +width, height: 1200 });
await p.goto(`http://localhost:3031${path}`, { waitUntil: "networkidle0", timeout: 90000 });
await new Promise((r) => setTimeout(r, 500));

const out = await p.evaluate(() => {
  // 和文を含み、かつ子に要素を持たない（＝本当のテキスト行）を拾う
  const hasJa = (s) => /[ぁ-んァ-ヶ一-龥]/.test(s);
  const nodes = [];
  const walk = (el) => {
    for (const c of el.childNodes) {
      if (c.nodeType === 3 && hasJa(c.textContent) && c.textContent.trim().length > 6) {
        const par = c.parentElement;
        // pre/code は等幅の仕様書。折り返しは意図的なので見ない
        if (par && !par.closest("svg") && !par.closest("pre") && !par.closest("code")
            && getComputedStyle(par).display !== "none") nodes.push(c);
      } else if (c.nodeType === 1) walk(c);
    }
  };
  walk(document.body);

  const res = [];
  for (const n of nodes) {
    const t = n.textContent;
    // 1文字ずつ矩形を取り、top が変わった所を行の境目とする
    const r = document.createRange();
    const lines = [];
    let cur = "";
    let lastTop = null;
    for (let i = 0; i < t.length; i++) {
      r.setStart(n, i); r.setEnd(n, i + 1);
      const rect = r.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) { cur += t[i]; continue; }
      const top = Math.round(rect.top);
      if (lastTop !== null && Math.abs(top - lastTop) > 3) { lines.push(cur); cur = ""; }
      cur += t[i];
      lastTop = top;
    }
    if (cur) lines.push(cur);
    if (lines.length > 1) {
      const el = n.parentElement;
      res.push({
        sel: `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]}`,
        lines: lines.map((l) => l.trim()),
      });
    }
  }
  return res;
});

const CLOSERS = "。、）」』】〉》・ー…！？：；";
console.log(`===== ${path} @ ${width}px =====`);
for (const b of out) {
  const bad = b.lines.slice(0, -1).filter((l) => l && !CLOSERS.includes(l[l.length - 1]));
  console.log(`\n[${b.sel}] ${b.lines.length}行  割れ${bad.length}`);
  b.lines.forEach((l, i) => {
    const last = l[l.length - 1];
    const isLast = i === b.lines.length - 1;
    const ok = isLast || (last && CLOSERS.includes(last));
    console.log(`  ${ok ? "  " : "▲ "}${l}`);
  });
}
await b.close();
