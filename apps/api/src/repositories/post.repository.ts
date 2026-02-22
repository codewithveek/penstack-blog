/**
 * apps/api/src/repositories/post.repository.ts
 *
 * All posts, post-authors, tags, post-tags, and post-views queries.
 * Implements IPostRepository.
 */

import {
  eq,
  and,
  sql,
  inArray,
  or,
  lt,
  gte,
  desc,
  asc,
  like,
  isNull,
} from "drizzle-orm";
import type { DB } from "@cms/core/db/client";
import {
  posts,
  postAuthors,
  postTags,
  tags,
  users,
  postViews,
} from "@cms/core/db/schema";
import type {
  Post,
  NewPost,
  Tag,
  PostAuthor,
  NewPostAuthor,
  PostTag,
} from "@cms/core/db/schema";
import type {
  IPostRepository,
  PostWithAuthorsAndTags,
  PostAuthorInput,
  PostFindManyParams,
  PaginatedResult,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";
import { User } from "@cms/core/db/schema";

export class PostRepository implements IPostRepository {
  constructor(private readonly db: DB) {}

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async hydratePost(
    siteId: string,
    post: Post
  ): Promise<PostWithAuthorsAndTags> {
    // Load authors with their user data
    const authorRows = await this.db
      .select({
        order: postAuthors.order,
        is_primary: postAuthors.is_primary,
        id: users.id,
        name: users.name,
        email: users.email,
        avatar_url: users.avatar_url,
        bio: users.bio,
        slug: users.slug,
        twitter: users.twitter,
        website: users.website,
      })
      .from(postAuthors)
      .innerJoin(users, eq(postAuthors.user_id, users.id))
      .where(
        and(eq(postAuthors.post_id, post.id), eq(postAuthors.site_id, siteId))
      )
      .orderBy(asc(postAuthors.order));

    // Load tags
    const tagRows = await this.db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        description: tags.description,
        feature_image: tags.feature_image,
        visibility: tags.visibility,
        site_id: tags.site_id,
        created_at: tags.created_at,
        updated_at: tags.updated_at,
      })
      .from(postTags)
      .innerJoin(
        tags,
        and(eq(postTags.tag_id, tags.id), eq(postTags.site_id, tags.site_id))
      )
      .where(and(eq(postTags.post_id, post.id), eq(postTags.site_id, siteId)))
      .orderBy(asc(postTags.order));

    const primaryAuthor = authorRows.find((a) => a.is_primary) ?? authorRows[0];

    return {
      ...post,
      authors: authorRows.map(({ order, is_primary, ...user }) => user as User),
      primaryAuthor: (primaryAuthor
        ? ({
            ...primaryAuthor,
            is_primary: primaryAuthor.is_primary,
          } as unknown as User)
        : null)!,
      tags: tagRows,
      primaryTag: tagRows[0] ?? null,
    };
  }

  // ─── Queries ─────────────────────────────────────────────────────────────────

  async findById(
    siteId: string,
    id: string
  ): Promise<PostWithAuthorsAndTags | null> {
    try {
      const rows = await this.db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.site_id, siteId),
            eq(posts.id, id),
            isNull(posts.deleted_at)
          )
        )
        .limit(1);
      if (!rows[0]) return null;
      return this.hydratePost(siteId, rows[0]);
    } catch (err) {
      throw new RepositoryError("Failed to find post by id", "findById", err);
    }
  }

  async findBySlug(
    siteId: string,
    slug: string
  ): Promise<PostWithAuthorsAndTags | null> {
    try {
      const rows = await this.db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.site_id, siteId),
            eq(posts.slug, slug),
            isNull(posts.deleted_at)
          )
        )
        .limit(1);
      if (!rows[0]) return null;
      return this.hydratePost(siteId, rows[0]);
    } catch (err) {
      throw new RepositoryError(
        "Failed to find post by slug",
        "findBySlug",
        err
      );
    }
  }

  async findByPermalink(
    siteId: string,
    permalink: string
  ): Promise<PostWithAuthorsAndTags | null> {
    try {
      const rows = await this.db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.site_id, siteId),
            eq(posts.permalink, permalink),
            isNull(posts.deleted_at)
          )
        )
        .limit(1);
      if (!rows[0]) return null;
      return this.hydratePost(siteId, rows[0]);
    } catch (err) {
      throw new RepositoryError(
        "Failed to find post by permalink",
        "findByPermalink",
        err
      );
    }
  }

  async findMany(
    siteId: string,
    params: PostFindManyParams
  ): Promise<PaginatedResult<PostWithAuthorsAndTags>> {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 15, 100);
    const offset = (page - 1) * limit;

    try {
      const conditions = [eq(posts.site_id, siteId), isNull(posts.deleted_at)];

      if (params.status) conditions.push(eq(posts.status, params.status));
      if (params.type) conditions.push(eq(posts.type, params.type));
      if (params.visibility)
        conditions.push(eq(posts.visibility, params.visibility));
      if (params.tagSlug) {
        // subquery — posts that have this tag
        const tagIds = await this.db
          .select({ id: tags.id })
          .from(tags)
          .where(and(eq(tags.site_id, siteId), eq(tags.slug, params.tagSlug)))
          .limit(1);
        if (tagIds[0]) {
          const postIdsWithTag = await this.db
            .select({ post_id: postTags.post_id })
            .from(postTags)
            .where(
              and(
                eq(postTags.site_id, siteId),
                eq(postTags.tag_id, tagIds[0].id)
              )
            );
          conditions.push(
            inArray(
              posts.id,
              postIdsWithTag.map((r) => r.post_id)
            )
          );
        }
      }
      if (params.authorSlug) {
        const authorIds = await this.db
          .select({ id: users.id })
          .from(users)
          .where(
            and(eq(users.site_id, siteId), eq(users.slug, params.authorSlug))
          )
          .limit(1);
        if (authorIds[0]) {
          const postIdsWithAuthor = await this.db
            .select({ post_id: postAuthors.post_id })
            .from(postAuthors)
            .where(
              and(
                eq(postAuthors.site_id, siteId),
                eq(postAuthors.user_id, authorIds[0].id)
              )
            );
          conditions.push(
            inArray(
              posts.id,
              postIdsWithAuthor.map((r) => r.post_id)
            )
          );
        }
      }

      const sortOrder = params.orderDirection === "asc" ? asc : desc;
      const sortColumn =
        params.orderBy === "published_at"
          ? posts.published_at
          : params.orderBy === "updated_at"
            ? posts.updated_at
            : posts.created_at;

      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(posts)
          .where(and(...conditions))
          .orderBy(sortOrder(sortColumn))
          .limit(limit)
          .offset(offset),
        this.db
          .select({ count: sql<number>`count(*)` })
          .from(posts)
          .where(and(...conditions)),
      ]);

      const hydrated = await Promise.all(
        rows.map((post) => this.hydratePost(siteId, post))
      );

      const total = countRow?.count ?? 0;
      return {
        data: hydrated,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      };
    } catch (err) {
      throw new RepositoryError("Failed to list posts", "findMany", err);
    }
  }

  async findScheduledReady(siteId: string): Promise<Post[]> {
    try {
      return this.db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.site_id, siteId),
            eq(posts.status, "scheduled"),
            isNull(posts.deleted_at),
            lt(posts.published_at, new Date())
          )
        );
    } catch (err) {
      throw new RepositoryError(
        "Failed to find scheduled posts",
        "findScheduledReady",
        err
      );
    }
  }

  // ─── Mutations ────────────────────────────────────────────────────────────────

  async create(data: NewPost): Promise<PostWithAuthorsAndTags> {
    try {
      await this.db.insert(posts).values(data);
      const created = await this.findById(data.site_id, data.id);
      if (!created)
        throw new RepositoryError("Post not found after insert", "create");
      return created;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create post", "create", err);
    }
  }

  async update(
    siteId: string,
    id: string,
    data: Partial<NewPost>
  ): Promise<PostWithAuthorsAndTags> {
    try {
      await this.db
        .update(posts)
        .set({ ...data, updated_at: new Date() })
        .where(and(eq(posts.site_id, siteId), eq(posts.id, id)));

      const updated = await this.findById(siteId, id);
      if (!updated) throw new NotFoundError("Post", id);
      return updated;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to update post", "update", err);
    }
  }

  async delete(siteId: string, id: string): Promise<void> {
    try {
      // Soft delete
      await this.db
        .update(posts)
        .set({ deleted_at: new Date() })
        .where(and(eq(posts.site_id, siteId), eq(posts.id, id)));
    } catch (err) {
      throw new RepositoryError("Failed to delete post", "delete", err);
    }
  }

  async publish(
    siteId: string,
    id: string,
    publishedAt: Date
  ): Promise<PostWithAuthorsAndTags> {
    try {
      await this.db
        .update(posts)
        .set({
          status: "published",
          published_at: publishedAt,
          updated_at: new Date(),
        })
        .where(and(eq(posts.site_id, siteId), eq(posts.id, id)));

      const published = await this.findById(siteId, id);
      if (!published) throw new NotFoundError("Post", id);
      return published;
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to publish post", "publish", err);
    }
  }

  async updateAllPermalinks(
    siteId: string,
    updates: Array<{ id: string; permalink: string }>
  ): Promise<void> {
    try {
      await Promise.all(
        updates.map(({ id, permalink }) =>
          this.db
            .update(posts)
            .set({ permalink })
            .where(and(eq(posts.site_id, siteId), eq(posts.id, id)))
        )
      );
    } catch (err) {
      throw new RepositoryError(
        "Failed to update permalinks",
        "updateAllPermalinks",
        err
      );
    }
  }

  // ─── Relations ────────────────────────────────────────────────────────────────

  async setAuthors(
    siteId: string,
    postId: string,
    authors: PostAuthorInput[]
  ): Promise<void> {
    try {
      await this.db
        .delete(postAuthors)
        .where(
          and(eq(postAuthors.site_id, siteId), eq(postAuthors.post_id, postId))
        );

      if (authors.length > 0) {
        const values: NewPostAuthor[] = authors.map((a, i) => ({
          id: crypto.randomUUID(),
          site_id: siteId,
          post_id: postId,
          user_id: a.userId,
          is_primary: a.isPrimary,
          order: a.order ?? i,
        }));
        await this.db.insert(postAuthors).values(values);
      }
    } catch (err) {
      throw new RepositoryError(
        "Failed to set post authors",
        "setAuthors",
        err
      );
    }
  }

  async setTags(
    siteId: string,
    postId: string,
    tagIds: string[]
  ): Promise<void> {
    try {
      await this.db
        .delete(postTags)
        .where(and(eq(postTags.site_id, siteId), eq(postTags.post_id, postId)));

      if (tagIds.length > 0) {
        const values = tagIds.map((tagId, i) => ({
          id: crypto.randomUUID(),
          site_id: siteId,
          post_id: postId,
          tag_id: tagId,
          order: i,
        }));
        await this.db.insert(postTags).values(values);
      }
    } catch (err) {
      throw new RepositoryError("Failed to set post tags", "setTags", err);
    }
  }

  async incrementViewCount(siteId: string, postId: string): Promise<void> {
    try {
      await this.db.insert(postViews).values({
        id: crypto.randomUUID(),
        site_id: siteId,
        post_id: postId,
        viewed_at: new Date(),
      });
    } catch (err) {
      throw new RepositoryError(
        "Failed to record post view",
        "incrementViewCount",
        err
      );
    }
  }
}
