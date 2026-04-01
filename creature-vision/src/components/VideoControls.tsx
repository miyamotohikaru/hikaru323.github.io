"use client";

interface Props {
  playing: boolean;
  muted: boolean;
  currentTime: number;
  duration: number;
  accentColor: string;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSeek: (time: number) => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VideoControls({
  playing,
  muted,
  currentTime,
  duration,
  accentColor,
  onTogglePlay,
  onToggleMute,
  onSeek,
}: Props) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="flex items-center gap-3 w-full mt-3 px-2"
      style={{ animation: "fadeIn 0.3s ease-out" }}
    >
      {/* Play/Pause */}
      <button
        onClick={onTogglePlay}
        className="flex-shrink-0 flex items-center justify-center cursor-pointer"
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: accentColor,
          color: "#fff",
          border: "none",
          fontSize: 16,
        }}
      >
        {playing ? "⏸" : "▶"}
      </button>

      {/* Progress bar */}
      <div
        className="flex-1 relative cursor-pointer"
        style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.08)" }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          onSeek(ratio * duration);
        }}
      >
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: `${progress}%`,
            borderRadius: 3,
            background: accentColor,
            transition: "width 0.1s",
          }}
        />
      </div>

      {/* Time */}
      <span className="flex-shrink-0" style={{ fontSize: 12, color: "#999", fontWeight: 500 }}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Mute */}
      <button
        onClick={onToggleMute}
        className="flex-shrink-0 cursor-pointer"
        style={{
          background: "none",
          border: "none",
          fontSize: 18,
        }}
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}
