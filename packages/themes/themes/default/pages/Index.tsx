/**
 * packages/themes/themes/default/pages/Index.tsx
 *
 * Home (index) page — lists posts with pagination.
 * PRD §12.2 required route: "index"
 */

import * as React from "react";
import type { ThemePageProps } from "@cms/core/types/theme";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { PostCard } from "../components/PostCard";
import { Pagination } from "../components/Pagination";

type IndexProps = ThemePageProps<{
  type: "index";
  posts: NonNullable<
    ThemePageProps["context"] extends { posts: infer P } ? P : never
  >;
}>;

export default function IndexPage({
  site,
  context,
  pagination,
}: ThemePageProps) {
  if (context.type !== "index") return null;

  return (
    <div className="theme-root">
      <SiteHeader site={site} />

      <main>
        <div className="theme-container">
          {/* Site hero (only on page 1) */}
          {(!pagination || pagination.page === 1) && (
            <section
              style={{
                padding: "64px 0 48px",
                borderBottom: "1px solid var(--theme-border)",
                marginBottom: "8px",
              }}
            >
              <h1
                style={{
                  fontSize: "clamp(28px, 5vw, 48px)",
                  fontWeight: 800,
                  margin: "0 0 12px",
                }}
              >
                {site.title}
              </h1>
              {site.description && (
                <p
                  style={{
                    color: "var(--theme-muted)",
                    fontSize: "18px",
                    maxWidth: "560px",
                    margin: 0,
                  }}
                >
                  {site.description}
                </p>
              )}
            </section>
          )}

          {/* Post list */}
          {context.posts.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--theme-muted)",
                padding: "80px 0",
              }}
            >
              No posts yet.
            </p>
          ) : (
            <div>
              {context.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {pagination && <Pagination pagination={pagination} />}
        </div>
      </main>

      <SiteFooter site={site} />
    </div>
  );
}
