/**
 * apps/api/src/controllers/post.controller.ts
 *
 * Orchestrates PostService calls.
 * No HTTP, no Drizzle, no SDK imports.
 */

import type { PostService } from "../services/post.service";
import type {
  PostWithAuthorsAndTags,
  PostFindManyParams,
  PaginatedResult,
  PostAuthorInput,
} from "@cms/core/types/repositories";
import type { z } from "zod";
import type {
  createPostSchema,
  updatePostSchema,
  listPostsQuerySchema,
} from "@cms/core/validators/post";

type CreatePostInput = z.infer<typeof createPostSchema>;
type UpdatePostInput = z.infer<typeof updatePostSchema>;
type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

export class PostController {
  constructor(private readonly postService: PostService) {}

  async create(
    siteId: string,
    actorId: string,
    input: CreatePostInput
  ): Promise<PostWithAuthorsAndTags> {
    return this.postService.createPost(siteId, {
      ...input,
      html: input.html ?? undefined,
      excerpt: input.excerpt ?? undefined,
      featureImage: undefined,
      authorId: actorId,
    });
  }

  async update(
    siteId: string,
    postId: string,
    input: UpdatePostInput
  ): Promise<PostWithAuthorsAndTags> {
    return this.postService.updatePost(siteId, postId, input);
  }

  async getById(
    siteId: string,
    postId: string
  ): Promise<PostWithAuthorsAndTags> {
    return this.postService.getById(siteId, postId);
  }

  async getBySlug(
    siteId: string,
    slug: string
  ): Promise<PostWithAuthorsAndTags> {
    return this.postService.getBySlug(siteId, slug);
  }

  async getByPermalink(
    siteId: string,
    permalink: string
  ): Promise<PostWithAuthorsAndTags> {
    return this.postService.getByPermalink(siteId, permalink);
  }

  async list(
    siteId: string,
    query: ListPostsQuery
  ): Promise<PaginatedResult<PostWithAuthorsAndTags>> {
    return this.postService.listPosts(siteId, query as PostFindManyParams);
  }

  async publish(
    siteId: string,
    postId: string
  ): Promise<PostWithAuthorsAndTags> {
    return this.postService.publishPost(siteId, postId);
  }

  async schedule(
    siteId: string,
    postId: string,
    scheduledAt: Date
  ): Promise<void> {
    return this.postService.schedulePost(siteId, postId, scheduledAt);
  }

  async unpublish(
    siteId: string,
    postId: string
  ): Promise<PostWithAuthorsAndTags> {
    return this.postService.unpublishPost(siteId, postId);
  }

  async delete(siteId: string, postId: string): Promise<void> {
    return this.postService.deletePost(siteId, postId);
  }

  async setAuthors(
    siteId: string,
    postId: string,
    authors: PostAuthorInput[]
  ): Promise<void> {
    return this.postService.updatePostAuthors(siteId, postId, authors);
  }

  async setTags(
    siteId: string,
    postId: string,
    tagIds: string[]
  ): Promise<void> {
    return this.postService.updatePostTags(siteId, postId, tagIds);
  }

  async trackView(siteId: string, postId: string): Promise<void> {
    return this.postService.trackView(siteId, postId);
  }
}
