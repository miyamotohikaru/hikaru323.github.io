// こすくまくんのセリフ帳。
//
// キャラクター: 月に腰まで刺さった、クリーム色のちいさなクマ。目は点で口はない。
// 世界中から剣を刺されているのに、のんびりしていて、ちょっと眠い。
// こわがるけど、怒らない。刺した人のことも、なんだかんだ好き。
//
// 書きかた:
//  - ひらがな多め、1行は最大20文字くらい(吹き出しが2行に収まる長さ)
//  - 「〜だよ」「〜なの」「〜かも」。命令形や説明口調は使わない
//  - おなじ場面で何度も出るので、被らないように多めに用意する

import type { SpeechTone } from "@/game/store";

export interface Line {
  text: string;
  tone: SpeechTone;
}

const n = (text: string): Line => ({ text, tone: "normal" });
const happy = (text: string): Line => ({ text, tone: "happy" });
const worry = (text: string): Line => ({ text, tone: "worry" });
const shock = (text: string): Line => ({ text, tone: "shock" });
const sleepy = (text: string): Line => ({ text, tone: "sleepy" });

/** ひまなとき(idleでときどき)。いちばん目にするので多めに */
export const IDLE: Line[] = [
  sleepy("ここ、けっこう しずかなんだ"),
  sleepy("……ねむい"),
  n("つき、ひんやりして きもちいいよ"),
  n("こしから した、どうなってるんだろ"),
  worry("だれか こないかな。……こわいけど"),
  n("ちきゅう、あんなに ちいさいんだね"),
  happy("けんが ふえると、にぎやかだね"),
  n("うごけないけど、ヒマじゃないよ"),
  sleepy("ながいこと ここにいる きがする"),
  worry("そっと でいいからね。そっと"),
  n("ほしを かぞえてたら わすれちゃった"),
  happy("きょうの きみ、いいセンスしてる"),
  n("さされるの、じつは ちょっと なれた"),
  worry("いつか とぶのかな。ぼく"),
  sleepy("……いま、ねてないよ。おきてる"),
  n("うちゅうって、おとが しないんだね"),
  happy("いろんな いろの けんが すきだよ"),
  n("あなが 1000こも あるんだって"),
  worry("あたりだけは やめてほしいなあ"),
  sleepy("せなか かゆいけど、とどかない"),
];

/** 穴の上にカーソル/指があるとき */
export const HOVER: Line[] = [
  worry("そこ？ ほんとに そこ？"),
  n("いいよ。……いいのかな"),
  worry("ちょっとだけ どきどきする"),
  n("ふかく ささなくて いいからね"),
  happy("いいあな みつけたね"),
  n("そこ、まだ だれも さしてないね"),
  worry("となりの あなじゃ だめ？"),
  sleepy("えらぶの、ゆっくりで いいよ"),
  n("ぼくは どこでも いたくないよ。たぶん"),
  happy("うん、そこ わるくない"),
];

/** 確認シートが出ているとき */
export const CONFIRM: Line[] = [
  worry("こころの じゅんび、させて"),
  n("すーっ、はーっ……よし"),
  worry("やさしく おねがいします"),
  n("いつでも どうぞ"),
  happy("けんの いろ、それが すき"),
];

/** 確認シートを長いこと開いたままのとき(2本目の間つなぎ) */
export const CONFIRM_WAIT: Line[] = [
  n("……まだ？"),
  sleepy("まってるあいだに ねちゃいそう"),
  worry("もしかして、まよってる？"),
  happy("じっくり えらんで いいからね"),
];

/** 剣が降りてくる(stabbing) */
export const STABBING: Line[] = [
  shock("く、くるっ"),
  worry("ぎゅっ"),
  shock("め、つぶってる！"),
  worry("いくよ……いくよ……"),
];

/** 判定待ち(suspense) */
export const SUSPENSE: Line[] = [
  shock("……"),
  worry("……どう？"),
  shock("しずかに してて"),
  worry("いま いちばん こわいとこ"),
];

/** セーフ(safe) */
export const SAFE: Line[] = [
  happy("ふぅ〜、たすかった"),
  happy("まだ いける！"),
  happy("いまの、ぎりぎりだったね"),
  happy("ありがとう。……ありがとう？"),
  happy("せーふ！ ぼく まだ ここにいる"),
  n("こしが ちょっと ずれた きがする"),
];

/** 自分が当てて飛ぶとき(勝者の画面) */
export const LAUNCH_ME: Line[] = [
  shock("あーーーーっ！！"),
  happy("とんでるーーー！"),
  shock("さようならーーーっ"),
];

/** 他の人が当てて飛ぶとき(観客の画面) */
export const LAUNCH_OTHER: Line[] = [
  shock("いっちゃった……！"),
  n("いってらっしゃい、ぼく"),
  shock("うわ、ほんとに とんだ"),
];

/** 新しい代が降りてきたとき */
export const NEW_ROUND: Line[] = [
  happy("はじめまして。ぼく、こすくまくん"),
  n("こんどは ぼくの ばんみたい"),
  happy("よろしくね。おてやわらかに"),
  n("あたらしい つきの におい がする"),
];

/** 他の人が刺した瞬間 */
export const REMOTE: Line[] = [
  shock("いま、だれか さしたよね？"),
  n("せかいの どこかから きた けんだ"),
  worry("うしろ！ ……いや、よこかも"),
  happy("にぎやかに なってきたね"),
  n("こんにちは、しらないひと"),
];

/** チャームを手に入れたとき */
export const CHARM: Line[] = [
  happy("けんが かわいく なってきた"),
  happy("それ、ぼくにも つけてほしい"),
  happy("じまんの けんだね"),
];

/** 剣のスキンを解放したとき */
export const SKIN: Line[] = [
  happy("うわ、ぴかぴか！"),
  happy("いいもの もらったね"),
];

/** クールダウンで刺せなかったとき */
export const COOLDOWN: Line[] = [
  sleepy("すこし やすもう。ね"),
  n("ぼくも いきを ととのえたい"),
  happy("そのあいだ、はなしでも する？"),
];

/** 地球をつついたとき(たまにしか言わない) */
export const EARTH_TAP: Line[] = [
  n("ちきゅう、つついてる？"),
  worry("あんまり いじめないで あげて"),
  happy("そこ、みんなが すんでるとこ"),
  sleepy("ぼくの ふるさと……だっけ"),
];

/** 地球が1000回で爆発したとき */
export const EARTH_BOOM: Line[] = [
  shock("ちきゅうーーーっ！！！"),
  shock("やっちゃった……！"),
];

/** あなが残りわずかなとき */
export const FEW_LEFT: Line[] = [
  worry("あな、もう すくないよ"),
  shock("そろそろ ぼく、とぶかも"),
];

/** 配列からランダムに1つ(直前と同じものは避ける) */
export function pick(lines: Line[], last?: string): Line {
  if (lines.length === 0) return n("……");
  if (lines.length === 1) return lines[0];
  for (let i = 0; i < 6; i++) {
    const c = lines[Math.floor(Math.random() * lines.length)];
    if (c.text !== last) return c;
  }
  return lines[0];
}
