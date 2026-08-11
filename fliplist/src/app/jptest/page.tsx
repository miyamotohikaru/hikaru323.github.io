"use client";

// 和文をドットで打てるかの検分用。本番の導線には出さない。
// http://localhost:3020/jptest

import PixelCanvas from "@/components/PixelCanvas";
import { PixelGfx } from "@/art/gfx";
import { NES } from "@/art/palette";

const SAMPLES = [
  "ブラックホール",
  "ジュミョウ",
  "ともだち",
  "ことばじてん",
  "とんで火入る虫",
  "生き物の視点",
  "人助け",
  "ゆらぎ",
];

export default function JpTest() {
  return (
    <main style={{ padding: 24, background: "#efeadc" }}>
      <p style={{ fontFamily: "DotGothic16", fontSize: 14 }}>
        和文の字母を書体から起こしたもの（16px・閾値128）
      </p>
      {SAMPLES.map((s) => (
        <div key={s} style={{ marginBottom: 10 }}>
          <PixelCanvas
            w={140}
            h={20}
            scale={4}
            draw={(g: PixelGfx) => {
              g.rect(0, 0, g.w, g.h, NES.cream);
              g.textJP(2, 2, s, NES.black, { size: 16 });
            }}
          />
        </div>
      ))}
      <div>
        <PixelCanvas
          w={68}
          h={40}
          scale={8}
          draw={(g: PixelGfx) => {
            // 68x40 のラベルに、実機ふうの縦組みの題字を置いてみる
            g.rect(0, 0, 68, 40, NES.navy);
            g.frame(0, 0, 68, 40, NES.black);
            g.textJP(3, 3, "ブラック", NES.white, { size: 16 });
            g.textJP(3, 20, "ホール", NES.yellow, { size: 16 });
          }}
        />
      </div>
    </main>
  );
}
