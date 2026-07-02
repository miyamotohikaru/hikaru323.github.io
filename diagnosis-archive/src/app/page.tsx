export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-xs tracking-[0.35em] text-da-accent">
        ISSUE 01 · COMING SOON
      </p>
      <h1 className="font-display text-6xl italic sm:text-7xl">
        Diagnosis<span className="text-da-accent">.</span> Archive
      </h1>
      <p className="font-mincho text-lg text-da-muted">
        その障害は、いつから障害になったのか。
      </p>
    </main>
  );
}
