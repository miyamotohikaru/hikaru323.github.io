"use client";

/**
 * 束を送るときの「カチッ」。音声ファイルは持たず、その場で合成する。
 *
 * 作りは こすくまくん危機一髪 の穴ホバー音と同じ考え方で、
 * ごく短いノイズ（高域だけ通す）＋高い正弦波を重ねる。
 * 速く連続するときは短く小さくして、ラチェットのように聞こえるようにする。
 *
 * AudioContext はユーザーの操作の中でしか作れないので、
 * 最初のドラッグやクリックのときに用意する。
 */

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;
let noise: AudioBuffer | null = null;
let last = 0;
let lastBuzz = 0;
let enabled = true;

/** 連続して鳴らすときの最短間隔(ms)。これより速い分は捨てる */
const MIN_GAP = 22;
/** 振動はもっと間引く。速い送りで鳴らし続けると唸りになる */
const MIN_BUZZ_GAP = 120;

export function setTickEnabled(on: boolean) {
  enabled = on;
}

/** ユーザー操作の中から呼ぶ。2回目以降は何もしない */
export function primeTick() {
  if (typeof window === "undefined" || ctx) return;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return;
  try {
    ctx = new AC();
    bus = ctx.createGain();
    bus.gain.value = 0.5;
    bus.connect(ctx.destination);
    // 使い回す短いホワイトノイズ
    const len = Math.floor(ctx.sampleRate * 0.05);
    noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } catch {
    ctx = null;
  }
}

/** カードが1枚ぶん送られた合図。速い送りでは自動的に控えめになる */
export function tick() {
  if (!enabled) return;
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  const gap = now - last;
  if (gap < MIN_GAP) return;
  last = now;

  // 速く回しているほど短く・小さく。ゆっくりのときは輪郭のある「カチッ」
  const slow = Math.min(gap / 220, 1);
  const peak = 0.03 + 0.05 * slow;
  const decay = 0.014 + 0.018 * slow;

  if (ctx && ctx.state === "suspended") void ctx.resume();
  if (ctx && bus && noise) {
    const t = ctx.currentTime;
    // 木のものが当たるような、ごく短い当たり
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    src.connect(hp).connect(g).connect(bus);
    src.start(t);
    src.stop(t + decay + 0.01);

    // 芯になる高い音。これがないと「サッ」としか聞こえない
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1750 + 250 * slow, t);
    const og = ctx.createGain();
    og.gain.setValueAtTime(peak * 0.6, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + decay * 0.9);
    osc.connect(og).connect(bus);
    osc.start(t);
    osc.stop(t + decay + 0.01);
  }

  // 対応している端末だけ。iOS には振動の仕組みがないので何も起きない
  if (now - lastBuzz > MIN_BUZZ_GAP) {
    lastBuzz = now;
    navigator.vibrate?.(5);
  }
}
