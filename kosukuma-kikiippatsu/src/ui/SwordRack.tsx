"use client";

// 剣えらび。おもちゃの箱に付いている「たるの横のカラフルな剣ラック」そのもの。
// 丸ドットではなく剣が横一列に立っていて、えらんだ1本だけスッと持ち上がる。
//
// - SwordRack     : 8色の剣ラック(確認シート/したく引き出しの両方で使う)
// - SkinRack      : 仕上げ(プラスチック/ぎん/きん/クリスタル/にじいろ)の陳列棚
// - SkinUnlockCard: とばした人へのスキン解放のお祝い(trophyフェーズ)
//
// 剣の絵は SwordArt(インラインSVG)。ラックの木/樹脂の厚み・スロットの穴・
// 落ち影は CSS で作っていて、剣先はラックの前板に隠れる = 挿さって見える。

import { useEffect, useState } from "react";
import {
  CHARMS,
  charmLevelOf,
  SWORD_COLORS,
  SWORD_SKINS,
} from "@/lib/config";
import { useGameStore, unlockedSkins } from "@/game/store";
import SwordArt from "./SwordArt";
import { CharmDisc } from "./CharmShelf";

/**
 * 南京錠のバッジ。絵文字の🔒は12〜14pxだと潰れて泥になるので、形は自前で描く。
 * 剣の上に大きく重ねると「何が手に入るのか」が見えなくなるので、カードの角に置く。
 */
function LockMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4.1 5.4 V4 a1.9 1.9 0 0 1 3.8 0 V5.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <rect x="2.5" y="5.2" width="7" height="5.3" rx="1.5" fill="currentColor" />
    </svg>
  );
}

/** 8色の剣が立っているラック。選んだ1本が持ち上がり、チャームがぶら下がる */
export function SwordRack() {
  const swordColor = useGameStore((s) => s.swordColor);
  const setSwordColor = useGameStore((s) => s.setSwordColor);
  const swordSkin = useGameStore((s) => s.swordSkin);
  const myTotal = useGameStore((s) => s.myTotal);
  const charms = charmLevelOf(myTotal);

  return (
    <div className="kk-rack">
      {/* ラックの土台(剣の後ろ) */}
      <div className="kk-rack-bar" aria-hidden="true" />
      <div className="kk-rack-row" role="radiogroup" aria-label="けんの いろ">
        {SWORD_COLORS.map((c, i) => {
          const sel = swordColor === i;
          return (
            <button
              key={c.hex}
              type="button"
              role="radio"
              aria-checked={sel}
              aria-label={`${c.name}の けん`}
              className={`kk-slot${sel ? " sel" : ""}`}
              onClick={() => setSwordColor(i)}
            >
              <span className="kk-slot-hole" aria-hidden="true" />
              <span className="kk-slot-shadow" aria-hidden="true" />
              <span className="kk-slot-sword">
                <SwordArt
                  color={i}
                  skin={swordSkin}
                  charms={sel ? charms : 0}
                />
              </span>
            </button>
          );
        })}
      </div>
      {/* ラックの前板(剣先を隠して「挿さっている」ように見せる) */}
      <div className="kk-rack-lip" aria-hidden="true" />
    </div>
  );
}

/** 仕上げの陳列棚。未解放は鍵つきで、押すと store がトーストを出す */
export function SkinRack() {
  const swordSkin = useGameStore((s) => s.swordSkin);
  const setSwordSkin = useGameStore((s) => s.setSwordSkin);
  const swordColor = useGameStore((s) => s.swordColor);
  const myWins = useGameStore((s) => s.myWins);
  const unlocked = new Set(unlockedSkins(myWins));
  const hasLocked = unlocked.size < SWORD_SKINS.length;

  return (
    <div className="kk-skins-wrap">
      <div className="kk-skins" role="radiogroup" aria-label="けんの しあげ">
        {SWORD_SKINS.map((s, i) => {
          const open = unlocked.has(i);
          const sel = swordSkin === i;
          return (
            <button
              key={s.name}
              type="button"
              role="radio"
              aria-checked={sel}
              aria-disabled={!open}
              aria-label={
                open
                  ? `${s.name}の けん`
                  : `${s.name}の けん(こすくまくんを とばすと つかえるよ)`
              }
              className={`kk-skin${sel ? " sel" : ""}${open ? "" : " lock"}`}
              // 未解放でも押させる: store がトーストで理由を教えてくれる
              onClick={() => setSwordSkin(i)}
            >
              {/* 未解放でも剣は等倍のまま見せる(何が手に入るか分からないと欲しくならない)。
                  鍵は右上の小さなバッジにして、剣の視認をじゃましない */}
              {!open && <LockMark className="kk-skin-lock" />}
              <span className="kk-skin-stage">
                <SwordArt color={swordColor} skin={i} />
              </span>
              <span className="kk-skin-name">{s.name}</span>
              <span className="kk-skin-sub">
                {open ? (sel ? "えらんでる" : "") : `${s.needWins}かい とばす`}
              </span>
            </button>
          );
        })}
      </div>
      {/* 解放の条件と、いままでの手がら。どちらも「誇らしさ」の材料 */}
      <div className="kk-skins-foot">
        {myWins > 0 && (
          <span className="kk-wins">
            とばした <b>{myWins}</b>かい
          </span>
        )}
        <span className="kk-skins-hint">
          {hasLocked ? (
            <>
              <LockMark className="kk-hint-lock" />
              こすくまくんを <b>とばすと</b> つかえるよ
            </>
          ) : (
            <>ぜんぶ つかえる！ さいこう！</>
          )}
        </span>
      </div>
    </div>
  );
}

/**
 * とばした人へのごほうび発表(phase === "trophy")。
 * 授与式の下のほうに、手に入れた剣を実物で見せる。
 * 同時にチャームがたまっていた場合(当たりの1本がちょうど10本目など)は
 * ここでまとめてお祝いして、演出済みとして store の newCharm を片付ける。
 */
export function SkinUnlockCard() {
  const newSkins = useGameStore((s) => s.newSkins);
  const newCharm = useGameStore((s) => s.newCharm);
  const swordColor = useGameStore((s) => s.swordColor);
  const clearNewCharm = useGameStore((s) => s.clearNewCharm);
  // 表示中に store が片付いても消えないよう、マウント時の値を握っておく
  const [charm] = useState(newCharm);

  useEffect(() => {
    if (charm !== null) clearNewCharm();
  }, [charm, clearNewCharm]);

  if (newSkins.length === 0 && charm === null) return null;

  const names = newSkins.map((i) => SWORD_SKINS[i]?.name ?? "").filter(Boolean);

  return (
    <div className="kk-unlock" role="status">
      <div className="kk-unlock-glow" aria-hidden="true" />
      {names.length > 0 && (
        <>
          <p className="kk-unlock-title">
            <b>{names.join(" と ")}</b>のけんを てにいれた！
          </p>
          <div className="kk-unlock-row">
            {newSkins.map((i) => (
              <span key={i} className="kk-unlock-sword">
                {/* 色がのるスキン(クリスタル)は、その人がいつも使っている色で見せる */}
                <SwordArt color={swordColor} skin={i} />
              </span>
            ))}
          </div>
        </>
      )}
      {charm !== null && (
        <p className="kk-unlock-charm">
          <CharmDisc index={charm} size={30} />
          <span>
            チャーム <b>{CHARMS[charm]?.name}</b> も てにいれた！
          </span>
        </p>
      )}
      <p className="kk-unlock-note">けんの したくから えらべるよ</p>
    </div>
  );
}
