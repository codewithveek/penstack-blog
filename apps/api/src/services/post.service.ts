/**
 * apps/api/src/services/post.service.ts
 *
 * Post business logic.
 * Enforces: "a post must have at least one primary author before publish"
 * Enforces: unique slug per site, permalink generation on publish.
 */

import type {
  IPostRepository,
  ITagRepository,
} from "@cms/core/types/repositories";
import type {
  IQueueProvider,
  ISearchProvider,
} from "@cms/core/types/providers";
import type {
  PostWithAuthorsAndTags,
  PostFindManyParams,
  PaginatedResult,
  PostAuthorInput,
} from "@cms/core/types/repositories";
import type { NewPost } from "@cms/core/db/schema";
import {
  NotFoundError,
  ConflictError,
  UnprocessableError,
  ValidationError,
} from "@cms/core/errors";
import {
  generateSlug,
  appendSlugSuffix,
  resolvePermalink,
} from "@cms/core/utils/permalink";
import { Cache, TTL } from "../lib/cache";
import type { ISettingsRepository } from "@cms/core/types/repositories";

const POST_QUEUE = "posts";

export class PostService {
  constructor(
    private readonly postRepo: IPostRepository,
    private readonly tagRepo: ITagRepository,
    private readonly settingsRepo: ISettingsRepository,
    private readonly queueProvider: IQueueProvider,
    private readonly searchProvider: ISearchProvider,
    private readonly cache: Cache
  ) {}

  // ─── Queries ─────────────────────────────────────────────────────────────────

  async getById(siteId: string, id: string): Promise<PostWithAuthorsAndTags> {
    const post = await this.postRepo.findById(siteId, id);
    if (!post) throw new NotFoundError("Post", id);
    return post;
  }

  async getBySlug(
    siteId: string,
    slug: string
  ): Promise<PostWithAuthorsAndTags> {
    const post = await this.postRepo.findBySlug(siteId, slug);
    if (!post) throw new NotFoundError("Post", slug);
    return post;
  }

  async getByPermalink(
    siteId: string,
    permalink: string
  ): Promise<PostWithAuthorsAndTags> {
    const cacheKey = Cache.postHtml(siteId, `permalink:${permalink}`);
    const cached = await this.cache.get<PostWithAuthorsAndTags>(cacheKey);
    if (cached) return cached;

    const post = await this.postRepo.findByPermalink(siteId, permalink);
    if (!post) throw new NotFoundError("Post", permalink);

    await this.cache.set(cacheKey, post, TTL.POST_HTML);
    return post;
  }

  async listPosts(
    siteId: string,
    params: PostFindManyParams
  ): Promise<PaginatedResult<PostWithAuthorsAndTags>> {
    return this.postRepo.findMany(siteId, params);
  }

  // ─── Mutations ────────────────────────────────────────────────────────────────

  async createPost(
    siteId: string,
    input: {
      title: string;
      type?: "post" | "page";
      slug?: string | undefined;
      lexical?: Record<string, unknown> | null | undefined;
      html?: string | undefined;
      excerpt?: string | undefined;
      featureImage?: string | undefined;
      visibility?: NewPost["visibility"] | undefined;
      authorId: string;
    }
  ): Promise<PostWithAuthorsAndTags> {
    const slug = await this.ensureUniqueSlug(
      siteId,
      input.slug ?? generateSlug(input.title)
    );

    const id = crypto.randomUUID();
    const now = new Date();

    const post = await this.postRepo.create({
      id,
      site_id: siteId,
      title: input.title,
      slug,
      permalink: slug, // Provisional — will be resolved on publish
      type: input.type ?? "post",
      status: "draft",
      visibility: input.visibility ?? "public",
      lexical: input.lexical ?? null,
      html: input.html ?? null,
      excerpt: input.excerpt ?? null,
      featured_image: input.featureImage ?? null,
      published_at: null,
      updated_at: now,
      created_at: now,
    });

    // Set primary author
    await this.postRepo.setAuthors(id, [
      { user_id: input.authorId, role: "primary", sort_order: 0 },
    ]);

    return this.postRepo.findById(
      siteId,
      id
    ) as Promise<PostWithAuthorsAndTags>;
  }

  async updatePost(
    siteId: string,
    id: string,
    input: {
      title?: string | undefined;
      slug?: string | undefined;
      lexical?: Record<string, unknown> | null | undefined;
      html?: string | null | undefined;
      excerpt?: string | null | undefined;
      featureImage?: string | null | undefined;
      visibility?: NewPost["visibility"] | undefined;
      codeInjectionHead?: string | null | undefined;
      codeInjectionFoot?: string | null | undefined;
      metaTitle?: string | null | undefined;
      metaDescription?: string | null | undefined;
      ogImage?: string | null | undefined;
      twitterImage?: string | null | undefined;
    }
  ): Promise<PostWithAuthorsAndTags> {
    const post = await this.postRepo.findById(siteId, id);
    if (!post) throw new NotFoundError("Post", id);

    let slug = input.slug;
    if (slug && slug !== post.slug) {
      slug = await this.ensureUniqueSlug(siteId, slug, id);
    }

    const updated = await this.postRepo.update(siteId, id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(slug && { slug }),
      ...(input.lexical !== undefined && { lexical: input.lexical }),
      ...(input.html !== undefined && { html: input.html }),
      ...(input.excerpt !== undefined && { excerpt: input.excerpt }),
      ...(input.featureImage !== undefined && {
        feature_image: input.featureImage,
      }),
      ...(input.visibility && { visibility: input.visibility }),
      ...(input.codeInjectionHead !== undefined && {
        custom_head_code: input.codeInjectionHead,
      }),
      ...(input.codeInjectionFoot !== undefined && {
        custom_foot_code: input.codeInjectionFoot,
      }),
      ...(input.metaTitle !== undefined && { og_title: input.metaTitle }),
      ...(input.metaDescription !== undefined && {
        og_description: input.metaDescription,
      }),
      ...(input.ogImage !== undefined && { og_image: input.ogImage }),
      ...(input.twitterImage !== undefined && {
        twitter_image: input.twitterImage,
      }),
    });
    void updated; // used for the DB write; hydrated version fetched below

    // Bust HTML cache
    await this.cache.invalidate(Cache.postHtml(siteId, id));

    return this.postRepo.findById(siteId, id) as Promise<PostWithAuthorsAndTags>;
  }

  async updatePostAuthors(
    siteId: string,
    postId: string,
    authors: PostAuthorInput[]
  ): Promise<void> {
    const post = await this.postRepo.findById(siteId, postId);
    if (!post) throw new NotFoundError("Post", postId);

    const hasPrimary = authors.some((a) => a.role === "primary");
    if (!hasPrimary) {
      throw new ValidationError(
        "At least one primary author is required"
      );
    }

    await this.postRepo.setAuthors(postId, authors);
  }

  async updatePostTags(
    siteId: string,
    postId: string,
    tagIds: string[]
  ): Promise<void> {
    const post = await this.postRepo.findById(siteId, postId);
    if (!post) throw new NotFoundError("Post", postId);

    // Validate all tagIds belong to this site
    for (const tagId of tagIds) {
      const tag = await this.tagRepo.findById(siteId, tagId);
      if (!tag) throw new NotFoundError("Tag", tagId);
    }

    await this.postRepo.setTags(siteId, postId, tagIds);
  }

  async publishPost(
    siteId: string,
    id: string
  ): Promise<PostWithAuthorsAndTags> {
    const post = await this.postRepo.findById(siteId, id);
    if (!post) throw new NotFoundError("Post", id);

    if (post.status === "published") {
      throw new ConflictError("Post is already published");
    }

    if (!post.authors || post.authors.length === 0) {
      throw new UnprocessableError(
        "Post must have at least one author before publishing"
      );
    }

    const primaryAuthor = post.authors.find((a) => a.role === "primary");
    if (!primaryAuthor) {
      throw new UnprocessableError(
        "Post must have a primary author before publishing"
      );
    }

    // Resolve permalink using site settings
    const permalinkPattern =
      (await this.settingsRepo.getSiteSetting(siteId, "permalink_pattern")) ??
      "/{slug}/";
    const primaryTagSlug = post.tags[0]?.slug;
    const permalink = resolvePermalink(
      { slug: post.slug, published_at: new Date() },
      permalinkPattern,
      primaryTagSlug
    );

    // publish sets status, permalink, and published_at atomically
    await this.postRepo.publish(siteId, id, permalink);

    // Index in search
    await this.searchProvider.index([
      {
        id: post.id,
        siteId,
        title: post.title,
        excerpt: post.excerpt ?? "",
        html: post.html ?? "",
      },
    ]);

    await this.cache.invalidate(Cache.postHtml(siteId, id));

    return this.postRepo.findById(
      siteId,
      id
    ) as Promise<PostWithAuthorsAndTags>;
  }

  async schedulePost(
    siteId: string,
    id: string,
    scheduledAt: Date
  ): Promise<void> {
    const post = await this.postRepo.findById(siteId, id);
    if (!post) throw new NotFoundError("Post", id);

    if (scheduledAt <= new Date()) {
      throw new ValidationError("Scheduled time must be in the future");
    }

    await this.postRepo.update(siteId, id, {
      status: "scheduled",
      published_at: scheduledAt,
    });

    // Enqueue job
    await this.queueProvider.scheduleAt(
      POST_QUEUE,
      "post.publish",
      { siteId, postId: id },
      scheduledAt
    );
  }

  async unpublishPost(
    siteId: string,
    id: string
  ): Promise<PostWithAuthorsAndTags> {
    const post = await this.postRepo.findById(siteId, id);
    if (!post) throw new NotFoundError("Post", id);

    await this.postRepo.update(siteId, id, {
      status: "draft",
      published_at: null,
    });

    await this.searchProvider.delete(id, siteId);
    await this.cache.invalidate(Cache.postHtml(siteId, id));
    return this.postRepo.findById(siteId, id) as Promise<PostWithAuthorsAndTags>;
  }

  async deletePost(siteId: string, id: string): Promise<void> {
    const post = await this.postRepo.findById(siteId, id);
    if (!post) throw new NotFoundError("Post", id);
    await this.postRepo.delete(siteId, id);
    await this.searchProvider.delete(id, siteId);
    await this.cache.invalidate(Cache.postHtml(siteId, id));
  }

  async trackView(siteId: string, postId: string): Promise<void> {
    const post = await this.postRepo.findById(siteId, postId);
    if (!post) return; // Silently ignore for public endpoints
    await this.postRepo.incrementViewCount(siteId, postId);
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async ensureUniqueSlug(
    siteId: string,
    slug: string,
    excludeId?: string
  ): Promise<string> {
    let candidate = slug;
    let attempt = 0;
    while (true) {
      const existing = await this.postRepo.findBySlug(siteId, candidate);
      if (!existing || existing.id === excludeId) return candidate;
      attempt++;
      candidate = appendSlugSuffix(slug, attempt);
    }
  }
}
