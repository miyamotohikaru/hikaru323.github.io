import { Fragment } from "react";
import MobileBreak from "./MobileBreak";

/**
 * 和文を、読みやすいところで折る。
 *
 * ブラウザの自動折り返しに任せると、行末が「…しまし／た。」のように
 * 語の途中で割れて読みにくい。だから折る位置をこちらで決める。
 *
 * ■ 三段構え
 *   1. 句点（。）で折る          … パソコンでも携帯でも改行
 *   2. 長い文は読点（、）で折る  … 同上
 *   3. それでも長い節は助詞で折る … 携帯だけの改行にもできる
 *
 * ■ 読点を最優先にする
 *   均等割りを先にやると、読点を跨いで「…置けば奥が／全部隠れ、」のように
 *   切れ目でない所で折れてしまう。まず読点で刻んで行に詰め、
 *   それでも長すぎる節だけを助詞で折る。
 *
 * ■ 助詞で折るときだけ「均等割り」
 *   前から詰めると最後に「して出てきた。」のような端切れが残るので、
 *   何行に分けるかを先に決めて、その等分点に近い切れ目を選ぶ。
 *
 * ■ 助詞は「複合語の途中」を避ける
 *   「と」で切ると「答えと／して」のように "として" を割ってしまう。
 *   後ろに来る字を見て、割ってはいけない組み合わせを除いてある。
 *
 * 手で位置を決めたいときは、本文に ◆（携帯だけ）／◇（両方）を埋める。
 * 読点も助詞も無い文（「原画→線画淡彩→立体折り紙」のような列）は
 * 機械では折れないので、その逃げ道が要る。
 */

/**
 * 行の長さ。文字数ではなく見た目の幅で測る。
 * 欧文と数字は和文の半分ほどしかないので、字数で数えると
 * 「MicrosoftのAcrylicとmacOS Big Surが…」のような行を
 * 長すぎると誤判定して、要らない所で折ってしまう。
 */
function width(s: string) {
  let w = 0;
  for (const ch of s) w += /[ -ÿ]/.test(ch) ? 0.55 : 1;
  return w;
}

/**
 * 折ってよい位置を全部拾う。返すのは「その位置より前に何文字あるか」。
 * 重みは「そこで折ったときの自然さ」。大きいほど折ってよい。
 */
function breakPoints(s: string) {
  const pts: { at: number; weight: number }[] = [];
  for (let i = 1; i < s.length; i++) {
    const prev = s[i - 1];
    const next = s[i];

    // 読点のあと。いちばん自然
    if (prev === "、") { pts.push({ at: i, weight: 3 }); continue; }

    // 助詞や小書きの字を行頭に置かない。
    // 「ことへ／の答え」のように、助詞と助詞のあいだで割ると必ず読みにくい
    if ("のはがをにでともやへ、。」』）】ゃゅょっぁぃぅぇぉーん".includes(next)) continue;

    // 中黒のあと。列挙の切れ目なので折ってよい
    if (prev === "・") { pts.push({ at: i, weight: 2 }); continue; }
    // 鉤括弧の前。引用の始まりは行頭に置ける
    if ("「『（【".includes(next)) { pts.push({ at: i, weight: 2 }); continue; }

    // 助詞のあと。ただし後ろの字と組んで一語になるものは除く
    const two = s.slice(i - 2, i);
    if (["から", "まで", "より", "ので", "のに", "には", "とは", "では", "ても"].includes(two)) {
      pts.push({ at: i, weight: 2 });
      continue;
    }
    // 「として」「という」「ところ」「とも」「とか」「となる」を割らない。
    // 「こと」「もと」「ひと」「あと」は名詞なので、その「と」でも割らない
    if (prev === "と" && !"しいこもかな".includes(next) && !"こもひあ".includes(s[i - 2])) {
      pts.push({ at: i, weight: 1 });
      continue;
    }
    // 「できる」「でしょう」「では」「でも」「です」を割らない
    if (prev === "で" && !"きしはもす".includes(next)) { pts.push({ at: i, weight: 1 }); continue; }
    // 「には」「にも」「について」「によって」を割らない。
    // 「ように」「ために」「ことに」「すでに」も一語として扱う
    const three = s.slice(i - 3, i);
    if (prev === "に" && !"はもつよ".includes(next)
        && !["ように", "ために", "ことに", "すでに", "とともに"].some((x) => three.endsWith(x))) {
      pts.push({ at: i, weight: 1 });
      continue;
    }
    // 「もの」「もちろん」を割らない
    if (prev === "も" && !"のち".includes(next)) { pts.push({ at: i, weight: 1 }); continue; }
    // 「やはり」を割らない
    if (prev === "や" && !"はが".includes(next)) { pts.push({ at: i, weight: 1 }); continue; }
    if ("をがはへ".includes(prev)) { pts.push({ at: i, weight: 1 }); continue; }
  }
  return pts;
}

/**
 * 上限に収まるよう折る。
 *   1. まず読点で刻み、行に詰める（読点は最優先の切れ目）
 *   2. それでも長い節だけ、助詞で均等に折る
 */
function fold(s: string, limit: number): string[] {
  if (width(s) <= limit) return [s];

  // 1. 読点で刻んで詰める
  const clauses = s.split(/(?<=、)/);
  const packed: string[] = [];
  let buf = "";
  for (const c of clauses) {
    if (buf && width(buf + c) > limit) { packed.push(buf); buf = c; }
    else buf += c;
  }
  if (buf) packed.push(buf);

  // 2. まだ長い行だけ助詞で折る
  return packed.flatMap((line) => (width(line) > limit ? foldAtParticles(line, limit) : [line]));
}

/** 助詞の位置で、なるべく均等に折る */
function foldAtParticles(s: string, limit: number): string[] {
  const w = width(s);
  const n = Math.ceil(w / limit);
  const pts = breakPoints(s);
  if (!pts.length) return [s]; // 折れる所が無い。記号で指定してもらうしかない

  const chosen: number[] = [];
  for (let k = 1; k < n; k++) {
    const target = (s.length * k) / n;
    let best = null as null | { at: number; score: number };
    for (const p of pts) {
      if (chosen.includes(p.at)) continue;
      // 等分点に近いほど良い。自然さ（weight）も少し効かせる
      const score = Math.abs(p.at - target) - p.weight * 1.6;
      if (!best || score < best.score) best = { at: p.at, score };
    }
    if (best) chosen.push(best.at);
  }
  chosen.sort((a, b) => a - b);

  const out: string[] = [];
  let from = 0;
  for (const at of chosen) {
    if (at > from) out.push(s.slice(from, at));
    from = at;
  }
  out.push(s.slice(from));
  return out.filter(Boolean);
}

export default function Jp({
  text,
  className,
  max = 34,
  mobileMax = 22,
}: {
  text: string;
  className?: string;
  /** パソコンでの1行の目安（和文の字数相当） */
  max?: number;
  /** 携帯での1行の目安。ここを超える分は携帯だけの改行にする */
  mobileMax?: number;
}) {
  // 0段目：手で指定された折り位置（◇＝両方）
  const hard: string[] = [];
  for (const forced of text.split(/(?<=◇)/)) {
    const body = forced.replace(/◇$/, "");
    if (!body) continue;
    // 1〜2段目：句点で折り、長すぎる文はさらに折る
    for (const sentence of body.split(/(?<=。)/).filter(Boolean)) {
      hard.push(...fold(sentence, max));
    }
  }

  return (
    <p className={className}>
      {hard.map((line, i) => {
        // 3段目：携帯でだけ長い行を、さらに折る。◆があればそれを優先
        const soft = line.includes("◆")
          ? line.split(/(?<=◆)/).map((x) => x.replace(/◆$/, "")).filter(Boolean)
          : fold(line, mobileMax);
        return (
          <span key={i} className="jp-l">
            {soft.map((s, j) => (
              <Fragment key={j}>
                {j > 0 && <MobileBreak />}
                {s}
              </Fragment>
            ))}
          </span>
        );
      })}
    </p>
  );
}
