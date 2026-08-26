import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({ executablePath: CHROME, args: ["--headless=new"] });
const p = await b.newPage();
p.on("response", (r) => { if (r.status() >= 400) console.log(r.status(), r.url()); });
for (const path of ["/", "/build", "/recipes", "/style/bauhaus"]) {
  console.log("--- " + path);
  await p.goto("http://localhost:3031" + path, { waitUntil: "networkidle0", timeout: 90000 });
}
await b.close();
