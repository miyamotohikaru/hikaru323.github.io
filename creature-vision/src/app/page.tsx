"use client";

import { Suspense, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import UploadScreen from "@/components/UploadScreen";
import SelectScreen from "@/components/SelectScreen";
import ViewScreen from "@/components/ViewScreen";
import { CREATURES } from "@/data/creatures";

type Phase = "upload" | "select" | "view";

function Home() {
  const searchParams = useSearchParams();
  // /?creature=dog でアクセスした場合、写真アップロード後に自動でその生き物を選ぶ
  const preselectParam = searchParams.get("creature");
  const preselected = CREATURES.some((c) => c.id === preselectParam)
    ? preselectParam
    : null;

  const [phase, setPhase] = useState<Phase>("upload");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState(CREATURES[0]?.id ?? "dolphin");
  const [favs, setFavs] = useState<string[]>([]);

  const handleFile = useCallback(
    (file: File) => {
      setMediaFile(file);
      if (preselected) {
        // ?creature=xxx 指定時は選択画面を飛ばして直接 view へ
        setSelectedId(preselected);
        setPhase("view");
      } else {
        setPhase("select");
      }
    },
    [preselected]
  );

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setPhase("view");
  }, []);

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }, []);

  if (phase === "upload") {
    const preselectedCreature =
      CREATURES.find((c) => c.id === preselected) ?? null;
    return (
      <UploadScreen
        creatures={CREATURES}
        onFile={handleFile}
        preselectedCreature={preselectedCreature}
      />
    );
  }

  if (phase === "select") {
    return (
      <SelectScreen
        creatures={CREATURES}
        favs={favs}
        onSelect={handleSelect}
        onBack={() => setPhase("upload")}
      />
    );
  }

  if (phase === "view" && mediaFile) {
    return (
      <ViewScreen
        creatures={CREATURES}
        selectedId={selectedId}
        mediaFile={mediaFile}
        favs={favs}
        onBack={() => setPhase("select")}
        onToggleFav={toggleFav}
        onSelect={(id) => setSelectedId(id)}
      />
    );
  }

  return null;
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
