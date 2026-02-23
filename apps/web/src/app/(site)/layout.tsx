import type { ReactNode } from "react";

// No Chakra here — theme CSS is loaded per-page inline by SiteRenderer.
// This layout is intentionally minimal.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
