import Link from "next/link";

export function TopNav() {
  return <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white/80 px-5 py-4 backdrop-blur lg:px-8">
    <Link href="/" className="font-semibold text-emerald-800">World Cup Lens</Link>
    <h1 className="text-xl font-semibold tracking-tight text-slate-950">History & match lab</h1>
    <Link href="/?mode=illustrative&date=2026-06-11" className="text-sm text-emerald-800 underline">Fictional AI lab</Link>
    <Link href="/about" className="text-sm text-emerald-800 underline">How it works</Link>
  </header>;
}
