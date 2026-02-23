/**
 * packages/themes/themes/default/components/PostCard.tsx
 */

import * as React from "react";
import type { ThemePostContext } from "@cms/core/types/theme";

interface PostCardProps {
  post: ThemePostContext;
}

export function PostCard({ post }: PostCardProps) {
  const publishedAt = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="theme-post-card">
      {post.featureImage && (
        <a href={post.url}>
          <img
            src={post.featureImage}
            alt={post.featureImageAlt ?? post.title}
            className="theme-post-card__image"
            loading="lazy"
          />
        </a>
      )}

      <div>
        {post.primaryTag && (
          <a href={post.primaryTag.url} className="theme-post-card__tag">
            {post.primaryTag.name}
          </a>
        )}

        <h2 className="theme-post-card__title">
          <a href={post.url}>{post.title}</a>
        </h2>

        {post.excerpt && (
          <p className="theme-post-card__excerpt">{post.excerpt}</p>
        )}

        <div className="theme-post-card__meta">
          {post.primaryAuthor.avatar && (
            <img
              src={post.primaryAuthor.avatar}
              alt={post.primaryAuthor.name}
              className="theme-author-avatar"
            />
          )}
          <span>
            <a href={post.primaryAuthor.url}>{post.primaryAuthor.name}</a>
          </span>
          {publishedAt && (
            <>
              <span>·</span>
              <time dateTime={post.publishedAt}>{publishedAt}</time>
            </>
          )}
          <span>·</span>
          <span>{post.readingTimeMinutes} min read</span>
        </div>
      </div>
    </article>
  );
}
