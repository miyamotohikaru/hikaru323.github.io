import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center px-4 pt-20 sm:px-6">
      <div className="mx-auto w-full max-w-[68rem]">
        <p className="label !text-accent tnum">404</p>
        <h1 className="mt-3 text-[1.75rem] font-medium leading-[1.25] tracking-[-0.025em] sm:text-[2.5rem]">
          このCASEは、まだ収録していません。
        </h1>
        <p className="mt-4 max-w-[34rem] text-13 leading-[1.95] text-mute">
          空白は、次の調査テーマとして扱う。収録判断の基準は「収録・編集方針」に置いてある。
        </p>
        <div className="mt-8 flex gap-6">
          <Link href="/cases" className="label transition-colors hover:!text-ink">
            ← 索引へ
          </Link>
          <Link href="/about" className="label transition-colors hover:!text-ink">
            収録・編集方針
          </Link>
        </div>
      </div>
    </main>
  );
}
