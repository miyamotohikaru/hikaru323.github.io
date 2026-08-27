import Header from "@/components/Header";
import BreakText from "@/components/BreakText";
import Footer from "@/components/Footer";
import BuildForm from "@/components/BuildForm";
import PlateImage from "@/components/PlateImage";
import { STYLES } from "@/data/styles";

export const metadata = {
  title: "プロンプトを組む",
  description:
    "様式・主題・判型・調子を選ぶだけで、比率も色も禁止事項も書き出した画像生成プロンプトができます。",
};

export default async function BuildPage({
  searchParams,
}: {
  searchParams: Promise<{ style?: string }>;
}) {
  const sp = await searchParams;

  /**
   * 図版80枚はサーバで描いて差し込む。
   * クライアント部品に取り込むと、選ぶためだけに数百KBのJSを積むことになる。
   */
  const picker = (
    <>
      {STYLES.map((s) => (
          <button
            key={s.slug}
            type="button"
            className="pick__b"
            data-pick={s.slug}
            data-hit="1"
            data-q={`${s.ja} ${s.en} ${s.slug} ${s.era} ${s.origin}`.toLowerCase()}
            title={`${s.ja}（${s.en}）`}
          >
            <span className="plate-frame">
              <PlateImage slug={s.slug} alt="" />
            </span>
            <span className="pick__n">{s.ja}</span>
          </button>
      ))}
    </>
  );

  return (
    <>
      <Header />
      <main className="shell bld__page">
        <div className="sec">
          <p className="label">Prompt Builder</p>
          <h1 className="sec__h">選ぶだけで、指示書になる。</h1>
          <p className="sec__lead">
            <BreakText text="様式と主題を選べば、比率・色・技法・禁止事項まで書き出した指示書ができます。そのままコピーして、ChatGPT や Gemini、Midjourney に貼ってください。" />
          </p>
        </div>

        <BuildForm styles={STYLES} picker={picker} initial={sp.style} />
      </main>
      <Footer />
    </>
  );
}
