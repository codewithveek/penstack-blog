/**
 * packages/themes/themes/default/pages/Author.tsx
 *
 * Author archive page. PRD §12.2 required route: "author"
 */

import * as React from "react";
import type { ThemePageProps } from "@cms/core/types/theme";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PostCard } from "../components/PostCard";
import { Pagination } from "../components/Pagination";

export default function AuthorPage({
  site,
  context,
  pagination,
}: ThemePageProps) {
  if (context.type !== "author") return null;

  const { author, posts } = context;

  return (
    <div className="theme-root">
      <SiteHeader site={site} />

      <main>
        <div className="theme-container">
          <header className="theme-taxonomy-header">
            {author.avatar && (
              <img
                src={author.avatar}
                alt={author.name}
                className="theme-author-avatar--lg"
              />
            )}
            <h1 className="theme-taxonomy-header__title">{author.name}</h1>
            {author.bio && (
              <p className="theme-taxonomy-header__desc">{author.bio}</p>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              {author.website && (
                <a
                  href={author.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--theme-muted)", fontSize: 14 }}
                >
                  Website
                </a>
              )}
              {author.twitter && (
                <a
                  href={`https://twitter.com/${author.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--theme-muted)", fontSize: 14 }}
                >
                  Twitter
                </a>
              )}
            </div>
          </header>

          {posts.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--theme-muted)",
                paddingBottom: 80,
              }}
            >
              No posts by this author yet.
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
