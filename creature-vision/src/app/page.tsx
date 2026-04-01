"use client";

import { useState, useCallback } from "react";
import UploadScreen from "@/components/UploadScreen";
import SelectScreen from "@/components/SelectScreen";
import ViewScreen from "@/components/ViewScreen";
import { CREATURES } from "@/data/creatures";

type Phase = "upload" | "select" | "view";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [selectedId, setSelectedId] = useState(CREATURES[0]?.id ?? "dolphin");
  const [favs, setFavs] = useState<string[]>([]);

  const handleFile = useCallback((file: File) => {
    setMediaFile(file);
    setIsVideo(file.type.startsWith("video/"));
    setPhase("select");
  }, []);

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
    return <UploadScreen creatures={CREATURES} onFile={handleFile} />;
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
        isVideo={isVideo}
        favs={favs}
        onBack={() => setPhase("select")}
        onToggleFav={toggleFav}
        onSelect={(id) => setSelectedId(id)}
      />
    );
  }

  return null;
}
