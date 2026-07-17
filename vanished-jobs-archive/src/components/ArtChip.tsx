import Link from "next/link";
import Image from "next/image";
import { Job } from "@/data/jobs";

/**
 * イラストがチップから少しはみ出すスタイルのリンクチップ（背景丸なし）。
 * 年表・系譜・「おなじ時代に消えたなかま」で共通利用。
 * 画像は public/jobs/t/ の余白なしサムネイル版を使う。
 * 画像なしの職業は通常のテキストチップになる。
 */
export default function ArtChip({
  job,
  href,
  ongoing = false,
  size = "sm",
  children,
}: {
  job: Job;
  href: string;
  ongoing?: boolean;
  size?: "sm" | "lg";
  children: React.ReactNode;
}) {
  const sm = size === "sm";
  const withArt = !!job.image;
  const thumb = withArt ? `/jobs/t/${job.image!.split("/").pop()}` : null;

  const pad = withArt
    ? sm
      ? "pl-[5.4rem] md:pl-[6.2rem]"
      : "pl-[8.6rem]"
    : sm
      ? "pl-3"
      : "pl-5";

  return (
    <Link
      href={href}
      className={`relative inline-flex items-center whitespace-nowrap rounded-xl tracking-wider transition-transform hover:-translate-y-0.5 ${
        sm ? "h-12 pr-3 text-[11px] md:h-14 md:pr-4 md:text-xs" : "h-20 pr-5 text-sm"
      } ${pad} ${ongoing ? "border border-dashed border-vja-blue text-vja-blue" : ""}`}
      style={ongoing ? undefined : { background: job.color, color: job.textColor }}
    >
      {thumb && (
        <Image
          src={thumb}
          alt=""
          width={280}
          height={280}
          className={`pointer-events-none absolute bottom-1 left-1 ${
            sm
              ? "h-[160%] max-w-[4.7rem] md:max-w-[5.5rem]"
              : "h-[155%] max-w-[7.6rem]"
          }`}
          style={{ objectFit: "contain", objectPosition: "left bottom", width: "auto" }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
