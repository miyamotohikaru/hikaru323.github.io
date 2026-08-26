/**
 * 図版の検分台。制作中の80枚を等倍と縮小で並べ、目で確かめるための頁。
 * 公開ページではない（サイト内から辿れる導線は置かない）。
 */
import { PLATES, PLATE_SLUGS } from "@/plates";
import { SPINE } from "@/data/spine";

export const metadata = { title: "図版検分" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ only?: string; size?: string }>;
}) {
  const sp = await searchParams;
  const only = sp.only ? sp.only.split(",") : null;
  const size = Number(sp.size ?? 260);

  const order = SPINE.map((s) => s.slug).filter((s) => PLATE_SLUGS.includes(s));
  const rest = PLATE_SLUGS.filter((s) => !order.includes(s));
  const slugs = [...order, ...rest].filter((s) => !only || only.includes(s));

  return (
    <main className="shell" style={{ paddingBlock: 32 }}>
      <p className="label" style={{ marginBottom: 20 }}>
        図版検分 — {slugs.length} / {SPINE.length}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fill, minmax(${size}px, 1fr))`,
          gap: 28,
        }}
      >
        {slugs.map((slug) => {
          const P = PLATES[slug];
          const s = SPINE.find((x) => x.slug === slug);
          return (
            <figure key={slug} style={{ margin: 0 }} data-plate={slug}>
              <div className="plate-frame">
                <P />
              </div>
              <figcaption
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 13, letterSpacing: "0.02em" }}>{s?.ja ?? slug}</span>
                <span className="label" style={{ fontSize: 9 }}>{slug}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </main>
  );
}
