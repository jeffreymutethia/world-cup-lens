import type { ReactNode } from "react";
import { NON_AFFILIATION_NOTICE } from "@/lib/curated-history";
import { TopNav, type PageSection } from "@/components/layout/top-nav";

export function AppShell({ children, section = "matches" }: { children: ReactNode; section?: PageSection }) {
  return <div className="site-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <TopNav section={section} />
    <main id="main-content" tabIndex={-1} className="archive-container page-content">{children}</main>
    <footer className="archive-container site-footer">
      <p>{NON_AFFILIATION_NOTICE}</p>
      <a href="/third-party-notices.txt">Software and icon notices</a>
    </footer>
  </div>;
}
