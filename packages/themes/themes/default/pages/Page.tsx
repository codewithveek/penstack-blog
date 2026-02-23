/**
 * packages/themes/themes/default/pages/Page.tsx
 *
 * Static page (type = "page"). PRD §12.2 required route: "page"
 * Same layout as Post but without byline / reading time / tags.
 */

import * as React from "react";
import type { ThemePageProps } from "@cms/core/types/theme";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export default function PagePage({ site, context }: ThemePageProps) {
  if (context.type !== "page") return null;

  const post = context.post;

  return (
    <div className="theme-root">
      <SiteHeader site={site} />

      <main>
        <div className="theme-content-container">
          <header className="theme-post-header">
            <h1 className="theme-post-title">{post.title}</h1>
          </header>
        </div>

        {post.featureImage && (
          <div className="theme-container" style={{ marginBottom: 40 }}>
            <img
              src={post.featureImage}
              alt={post.featureImageAlt ?? post.title}
              className="theme-feature-image"
            />
          </div>
        )}

        <div className="theme-content-container">
          <div
            className="theme-content"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </div>
      </main>

      <SiteFooter site={site} />
    </div>
  );
}
