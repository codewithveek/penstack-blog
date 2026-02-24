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
  lt,
  desc,
  asc,
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
  User,
} from "@cms/core/db/schema";
import type {
  IPostRepository,
  PostWithAuthorsAndTags,
  PostAuthorInput,
  PostFindManyParams,
  PaginatedResult,
} from "@cms/core/types/repositories";
import { NotFoundError, RepositoryError } from "@cms/core/errors";

export class PostRepository implements IPostRepository {
  constructor(private readonly db: DB) {}

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async hydratePost(
    _siteId: string,
    post: Post
  ): Promise<PostWithAuthorsAndTags> {
    // Load authors with their user data
    const authorRows = await this.db
      .select({
        role: postAuthors.role,
        sort_order: postAuthors.sort_order,
        user: {
          id: users.id,
          site_id: users.site_id,
          name: users.name,
          email: users.email,
          password: users.password,
          slug: users.slug,
          role: users.role,
          bio: users.bio,
          image: users.image,
          cover_image: users.cover_image,
          website: users.website,
          twitter: users.twitter,
          facebook: users.facebook,
          location: users.location,
          emailVerified: users.emailVerified,
          is_super_admin: users.is_super_admin,
          last_login_at: users.last_login_at,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          deleted_at: users.deleted_at,
        },
      })
      .from(postAuthors)
      .innerJoin(users, eq(postAuthors.user_id, users.id))
      .where(eq(postAuthors.post_id, post.id))
      .orderBy(asc(postAuthors.sort_order));

    // Load tags
    const tagRows = await this.db
      .select({
        id: tags.id,
        site_id: tags.site_id,
        name: tags.name,
        slug: tags.slug,
        description: tags.description,
        feature_image: tags.feature_image,
        visibility: tags.visibility,
        og_title: tags.og_title,
        og_description: tags.og_description,
        og_image: tags.og_image,
        created_at: tags.created_at,
        updated_at: tags.updated_at,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tag_id, tags.id))
      .where(eq(postTags.post_id, post.id))
      .orderBy(asc(postTags.sort_order));

    return {
      ...post,
      authors: authorRows.map((row) => ({
        user: row.user as User,
        role: row.role,
        sort_order: row.sort_order,
      })),
      tags: tagRows as Tag[],
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
            .where(eq(postTags.tag_id, tagIds[0].id));
          conditions.push(
            inArray(
              posts.id,
              postIdsWithTag.map((r) => r.post_id)
            )
          );
        }
      }
      if (params.authorId) {
        const postIdsWithAuthor = await this.db
          .select({ post_id: postAuthors.post_id })
          .from(postAuthors)
          .where(eq(postAuthors.user_id, params.authorId));
        conditions.push(
          inArray(
            posts.id,
            postIdsWithAuthor.map((r) => r.post_id)
          )
        );
      }

      const sortDir = params.sortOrder === "asc" ? asc : desc;
      const sortColumn =
        params.sortBy === "published_at"
          ? posts.published_at
          : params.sortBy === "updated_at"
            ? posts.updated_at
            : posts.created_at;

      const [rows, [countRow]] = await Promise.all([
        this.db
          .select()
          .from(posts)
          .where(and(...conditions))
          .orderBy(sortDir(sortColumn))
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

  async findScheduledReady(now: Date): Promise<Post[]> {
    try {
      return this.db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.status, "scheduled"),
            isNull(posts.deleted_at),
            lt(posts.scheduled_at, now)
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

  async create(data: NewPost): Promise<Post> {
    try {
      await this.db.insert(posts).values(data);
      const rows = await this.db
        .select()
        .from(posts)
        .where(eq(posts.id, data.id!))
        .limit(1);
      if (!rows[0])
        throw new RepositoryError("Post not found after insert", "create");
      return rows[0];
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError("Failed to create post", "create", err);
    }
  }

  async update(
    siteId: string,
    id: string,
    data: Partial<NewPost>
  ): Promise<Post> {
    try {
      await this.db
        .update(posts)
        .set({ ...data, updated_at: new Date() })
        .where(and(eq(posts.site_id, siteId), eq(posts.id, id)));

      const rows = await this.db
        .select()
        .from(posts)
        .where(and(eq(posts.site_id, siteId), eq(posts.id, id)))
        .limit(1);
      if (!rows[0]) throw new NotFoundError("Post", id);
      return rows[0];
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

  async publish(siteId: string, id: string, permalink: string): Promise<Post> {
    try {
      await this.db
        .update(posts)
        .set({
          status: "published",
          permalink,
          published_at: new Date(),
          updated_at: new Date(),
        })
        .where(and(eq(posts.site_id, siteId), eq(posts.id, id)));

      const rows = await this.db
        .select()
        .from(posts)
        .where(and(eq(posts.site_id, siteId), eq(posts.id, id)))
        .limit(1);
      if (!rows[0]) throw new NotFoundError("Post", id);
      return rows[0];
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof RepositoryError)
        throw err;
      throw new RepositoryError("Failed to publish post", "publish", err);
    }
  }

  async updateAllPermalinks(
    siteId: string,
    updates: Array<{ id: string; oldPermalink: string; newPermalink: string }>
  ): Promise<void> {
    try {
      await Promise.all(
        updates.map(({ id, newPermalink }) =>
          this.db
            .update(posts)
            .set({ permalink: newPermalink })
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

  async setAuthors(postId: string, authors: PostAuthorInput[]): Promise<void> {
    try {
      await this.db
        .delete(postAuthors)
        .where(eq(postAuthors.post_id, postId));

      if (authors.length > 0) {
        await this.db.insert(postAuthors).values(
          authors.map((a, i) => ({
            post_id: postId,
            user_id: a.user_id,
            role: a.role,
            sort_order: a.sort_order ?? i,
          }))
        );
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
        .where(eq(postTags.post_id, postId));

      if (tagIds.length > 0) {
        await this.db.insert(postTags).values(
          tagIds.map((tagId, i) => ({
            post_id: postId,
            tag_id: tagId,
            sort_order: i,
          }))
        );
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
