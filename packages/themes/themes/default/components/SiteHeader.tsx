/**
 * packages/themes/themes/default/components/SiteHeader.tsx
 *
 * Shared site header used by all default theme pages.
 * Receives data only through ThemeSiteContext — no API calls, no DB access.
 */

import * as React from "react";
import type { ThemeSiteContext } from "@cms/core/types/theme";

interface SiteHeaderProps {
  site: ThemeSiteContext;
}

export function SiteHeader({ site }: SiteHeaderProps) {
  return (
    <header className="theme-site-header">
      <div className="theme-container">
        <div className="theme-site-header__inner">
          {/* Logo / title */}
          <a href="/" className="theme-site-title">
            {site.logo ? (
              <img src={site.logo} alt={site.title} height={32} />
            ) : (
              site.title
            )}
          </a>

          {/* Navigation */}
          {site.navigation.length > 0 && (
            <nav aria-label="Site navigation">
              <ul className="theme-site-nav">
                {site.navigation.map((item) => (
                  <li key={item.url}>
                    <a href={item.url}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
