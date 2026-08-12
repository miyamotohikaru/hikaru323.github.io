/**
 * 訪問者カウンター。
 * 本物のHPは天に
 *   <p class="blink">あなたは <img src="/count/npc.cgi?..."> 人目の訪問者です。</p>
 * を置いていて、その画像は height:30px・青の3px枠で出ている（本物 home.css）。
 * ここはCGIが無いので、黒地に白い数字の画像風をCSSで組む。枠は本物と同じ。
 */

/** 数はCGIではないので固定。桁数は昔のカウンターにならって7桁 */
const VISITS = "0002486";

export default function Counter() {
  return (
    <span className="count" role="img" aria-label={`${Number(VISITS)}人目`}>
      {VISITS.split("").map((n, i) => (
        <b key={i}>{n}</b>
      ))}
    </span>
  );
}
