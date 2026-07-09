"use client";

// エフェクト統括。<Canvas> 内でマウントされる(DOMは書かない)。
// フェーズ駆動のもの(剣・降臨ビーム・紙吹雪)はここでマウント/アンマウントし、
// イベント駆動のもの(土煙・発射)は常駐させてフェーズをまたいでも粒子を切らさない。

import { useGameStore } from "@/game/store";
import StabSword from "./StabSword";
import ImpactDust from "./ImpactDust";
import LaunchFx from "./LaunchFx";
import NewRoundBeam from "./NewRoundBeam";
import TrophyConfetti from "./TrophyConfetti";

export default function EffectsRoot() {
  const phase = useGameStore((s) => s.phase);
  // 剣は「構え→刺す→震え→セーフ」まで出しっぱなし。idle に戻ると Swords 側に引き継がれる
  const sword = phase === "stabbing" || phase === "suspense" || phase === "safe";

  return (
    <group>
      {sword && <StabSword />}
      <ImpactDust />
      <LaunchFx />
      {phase === "new-round" && <NewRoundBeam />}
      {phase === "trophy" && <TrophyConfetti />}
    </group>
  );
}
