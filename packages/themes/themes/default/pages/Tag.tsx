/**
 * packages/themes/themes/default/pages/Tag.tsx
 *
 * Tag archive page. PRD §12.2 required route: "tag"
 */

import * as React from "react";
import type { ThemePageProps } from "@cms/core/types/theme";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PostCard } from "../components/PostCard";
import { Pagination } from "../components/Pagination";

export default function TagPage({ site, context, pagination }: ThemePageProps) {
  if (context.type !== "tag") return null;

  const { tag, posts } = context;

  return (
    <div className="theme-root">
      <SiteHeader site={site} />

      <main>
        <div className="theme-container">
          <header className="theme-taxonomy-header">
            <p className="theme-taxonomy-header__label">Tag</p>
            <h1 className="theme-taxonomy-header__title">{tag.name}</h1>
            {tag.description && (
              <p className="theme-taxonomy-header__desc">{tag.description}</p>
            )}
          </header>

          {posts.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--theme-muted)",
                paddingBottom: 80,
              }}
            >
              No posts with this tag yet.
            </p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}

          {pagination && <Pagination pagination={pagination} />}
        </div>
      </main>

      <SiteFooter site={site} />
    </div>
  );
}
