"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

export type PageSection = "matches" | "about" | "archive";

export function TopNav({ section }: { section: PageSection }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header className="site-header">
      <div className="archive-container header-inner" onKeyDown={event => {
        if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); }
      }}>
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="M12 4v16M4 12h16" /></svg></span>
          <span><strong>World Cup Lens</strong><small>Unofficial · 2026 archive</small></span>
        </Link>
        <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>
          {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}<span>Menu</span>
        </button>
        <nav id="primary-navigation" aria-label="Primary" className="primary-navigation" data-open={open}>
          <Link href="/" aria-current={section === "matches" ? "page" : undefined} onClick={() => setOpen(false)}>Matches</Link>
          <Link href="/about" aria-current={section === "about" ? "page" : undefined} onClick={() => setOpen(false)}>How it works</Link>
          <a className="github-link" href="https://github.com/jeffreymutethia/world-cup-lens">GitHub <ArrowUpRight size={15} aria-hidden="true" /></a>
        </nav>
      </div>
    </header>
  );
}
