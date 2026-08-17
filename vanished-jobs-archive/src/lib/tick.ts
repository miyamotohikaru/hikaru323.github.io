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

/**
 * 連続して鳴らすときの最短間隔(ms)。これより速い分は捨てる。
 * 指を速く動かしたぶんだけ音も詰まってほしいので、詰められる上限は高くとる。
 */
const MIN_GAP = 14;
/** 振動はもっと間引く。速い送りで鳴らし続けると唸りになる */
const MIN_BUZZ_GAP = 120;

/**
 * 鳴らすかどうか。いまは切り替えを置いていないので誰も呼ばない。
 * （既定で鳴る側にしてある）
 */
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

  // 速く回しているほど短く・小さく。ゆっくりのときは輪郭のある「コッ」
  const slow = Math.min(gap / 220, 1);
  const peak = 0.035 + 0.055 * slow;
  const decay = 0.016 + 0.022 * slow;

  if (ctx && ctx.state === "suspended") void ctx.resume();
  if (ctx && bus && noise) {
    const t = ctx.currentTime;
    // 木のものが当たるような、ごく短い当たり
    const src = ctx.createBufferSource();
    src.buffer = noise;
    // 低めに寄せる。高く切ると「チッ」と細くなり、木の当たりに聞こえない
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    src.connect(hp).connect(lp).connect(g).connect(bus);
    src.start(t);
    src.stop(t + decay + 0.01);

    // 芯になる音。これがないと「サッ」としか聞こえない。
    // 速く回すほど少し低くして、詰まったときに耳ざわりにならないようにする
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(780 + 260 * slow, t);
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

/**
 * カードを開くときの音。送りの「コッ」より低く、少し長く残す。
 * 同じ音だと「送った」のか「開いた」のか区別がつかない。
 */
export function tapSound() {
  if (!enabled) return;
  if (ctx && ctx.state === "suspended") void ctx.resume();
  if (!ctx || !bus || !noise) return;
  const t = ctx.currentTime;

  const src = ctx.createBufferSource();
  src.buffer = noise;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 620;
  bp.Q.value = 1.1;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.1, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  src.connect(bp).connect(g).connect(bus);
  src.start(t);
  src.stop(t + 0.1);

  // 置いたときの余韻。少し下がりながら消える
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(360, t + 0.11);
  const og = ctx.createGain();
  og.gain.setValueAtTime(0.075, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
  osc.connect(og).connect(bus);
  osc.start(t);
  osc.stop(t + 0.14);

  navigator.vibrate?.(12);
}
