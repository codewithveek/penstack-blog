/**
 * packages/themes/themes/default/components/SiteFooter.tsx
 */

import * as React from "react";
import type { ThemeSiteContext } from "@cms/core/types/theme";

interface SiteFooterProps {
  site: ThemeSiteContext;
}

export function SiteFooter({ site }: SiteFooterProps) {
  return (
    <footer className="theme-site-footer">
      <div className="theme-container">
        <div className="theme-site-footer__inner">
          <span>
            © {new Date().getFullYear()} {site.title}
          </span>
          <span>Powered by PenStack</span>
        </div>
      </div>
    </footer>
  );
}
