/**
 * packages/themes/themes/default/pages/Archive.tsx
 *
 * Full archive page — lists all posts chronologically.
 * PRD §12.2 required route: "archive"
 */

import * as React from "react";
import type { ThemePageProps } from "@cms/core/types/theme";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PostCard } from "../components/PostCard";
import { Pagination } from "../components/Pagination";

export default function ArchivePage({
  site,
  context,
  pagination,
}: ThemePageProps) {
  if (context.type !== "archive") return null;

  return (
    <div className="theme-root">
      <SiteHeader site={site} />

      <main>
        <div className="theme-container">
          <header className="theme-taxonomy-header">
            <h1 className="theme-taxonomy-header__title">Archive</h1>
            <p className="theme-taxonomy-header__desc">
              All posts on {site.title}
            </p>
          </header>

          {context.posts.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--theme-muted)",
                paddingBottom: 80,
              }}
            >
              No posts yet.
            </p>
          ) : (
            context.posts.map((post) => <PostCard key={post.id} post={post} />)
          )}

          {pagination && <Pagination pagination={pagination} />}
        </div>
      </main>

      <SiteFooter site={site} />
    </div>
  );
}
