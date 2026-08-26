import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new", "--hide-scrollbars", "--force-device-scale-factor=2"] });
const p = await b.newPage();
await p.setViewport({ width: 1440, height: 1150, deviceScaleFactor: 2 });
await p.goto("http://localhost:3031/", { waitUntil: "networkidle0", timeout: 90000 });
await p.evaluate(() => { const s = document.querySelector(".sec"); if (s) window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY - 90); });
await new Promise((r) => setTimeout(r, 700));
// 「サブカル」を押した状態を撮る
const idx = 0;
const btns = await p.$$(".ctl__mood");
await btns[idx].click();
await new Promise((r) => setTimeout(r, 500));
await p.screenshot({ path: "shots/mood.png" });
console.log("shots/mood.png");
await b.close();
