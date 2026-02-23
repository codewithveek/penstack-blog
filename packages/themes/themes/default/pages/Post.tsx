/**
 * packages/themes/themes/default/pages/Post.tsx
 *
 * Single post page. PRD §12.2 required route: "post"
 */

import * as React from "react";
import type { ThemePageProps } from "@cms/core/types/theme";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { MembersGate } from "../components/MembersGate";

export default function PostPage({ site, context }: ThemePageProps) {
  if (context.type !== "post") return null;

  const post = context.post;

  const publishedAt = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const showGate = post.visibility !== "public";

  return (
    <div className="theme-root">
      <SiteHeader site={site} />

      <main>
        {/* Post header */}
        <div className="theme-content-container">
          <header className="theme-post-header">
            {post.primaryTag && (
              <a
                href={post.primaryTag.url}
                className="theme-post-card__tag"
                style={{ marginBottom: 16, display: "inline-block" }}
              >
                {post.primaryTag.name}
              </a>
            )}

            <h1 className="theme-post-title">{post.title}</h1>

            <div className="theme-post-byline">
              {post.primaryAuthor.avatar && (
                <img
                  src={post.primaryAuthor.avatar}
                  alt={post.primaryAuthor.name}
                  className="theme-author-avatar"
                />
              )}
              <div>
                <a href={post.primaryAuthor.url} style={{ color: "inherit" }}>
                  {post.primaryAuthor.name}
                </a>
                {post.authors.length > 1 && (
                  <span>
                    {" "}
                    &amp;{" "}
                    {post.authors
                      .slice(1)
                      .map((a) => a.name)
                      .join(", ")}
                  </span>
                )}
              </div>
              {publishedAt && <span>·</span>}
              {publishedAt && (
                <time dateTime={post.publishedAt}>{publishedAt}</time>
              )}
              <span>·</span>
              <span>{post.readingTimeMinutes} min read</span>
            </div>
          </header>
        </div>

        {/* Feature image (full-width) */}
        {post.featureImage && (
          <div className="theme-container" style={{ marginBottom: 40 }}>
            <img
              src={post.featureImage}
              alt={post.featureImageAlt ?? post.title}
              className="theme-feature-image"
            />
          </div>
        )}

        {/* Post content */}
        <div className="theme-content-container">
          {showGate ? (
            <>
              {/* Show excerpt then gate */}
              {post.excerpt && (
                <div
                  className="theme-content"
                  style={{ marginBottom: 24 }}
                  dangerouslySetInnerHTML={{ __html: `<p>${post.excerpt}</p>` }}
                />
              )}
              <MembersGate
                visibility={post.visibility as "members" | "paid"}
                siteUrl={site.url}
                paidMembershipsEnabled={site.paidMembershipsEnabled}
              />
            </>
          ) : (
            <div
              className="theme-content"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          )}

          {/* Custom code injection */}
          {post.codeInjection?.foot && (
            <div
              dangerouslySetInnerHTML={{ __html: post.codeInjection.foot }}
            />
          )}
        </div>
      </main>

      <SiteFooter site={site} />
    </div>
  );
}
