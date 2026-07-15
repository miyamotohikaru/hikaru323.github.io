"use client";

// アプリの組み立てルート。3Dキャンバスの上にUIオーバーレイを重ねる。

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useGameStore } from "@/game/store";
import AudioDirector from "@/game/audio/AudioDirector";
import TitleScreen from "./TitleScreen";
import Hud from "./Hud";
import NameModal from "./NameModal";
import Toast from "./Toast";

const GameCanvas = dynamic(() => import("@/game/scene/GameCanvas"), {
  ssr: false,
});

export default function Game() {
  const init = useGameStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="game-root">
      <GameCanvas />
      <Hud />
      <TitleScreen />
      <NameModal />
      <Toast />
      <AudioDirector />
    </div>
  );
}
