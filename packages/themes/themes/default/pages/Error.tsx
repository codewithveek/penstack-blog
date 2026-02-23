/**
 * packages/themes/themes/default/pages/Error.tsx
 *
 * Error page (404, 500, etc.). PRD §12.2 required route: "error"
 */

import * as React from "react";
import type { ThemePageProps } from "@cms/core/types/theme";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export default function ErrorPage({ site, context }: ThemePageProps) {
  if (context.type !== "error") return null;

  const { statusCode, message } = context;

  return (
    <div className="theme-root">
      <SiteHeader site={site} />

      <main>
        <div className="theme-content-container" style={{ textAlign: "center", padding: "80px 20px" }}>
          <h1 style={{ fontSize: "6rem", fontWeight: 800, margin: 0, color: "var(--theme-accent, #6366f1)" }}>
            {statusCode}
          </h1>
          <p style={{ fontSize: "1.25rem", color: "#6b7280", marginTop: 16 }}>
            {message}
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: 32,
              padding: "12px 24px",
              borderRadius: 6,
              backgroundColor: "var(--theme-accent, #6366f1)",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Go back home
          </a>
        </div>
      </main>

      <SiteFooter site={site} />
    </div>
  );
}
