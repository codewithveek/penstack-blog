import "server-only";
import { db } from "@/db";
import { posts, users } from "@/db/schemas";
import { AuthorSelect, PostInsert, UserSelect } from "@/types";
import { desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getAuthorByUsername = unstable_cache(
  async (username: string) => {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username.toLowerCase()),
      columns: {
        name: true,
        avatar: true,
        username: true,
        bio: true,
        email: true,
        auth_id: true,
        id: true,
        created_at: true,
        updated_at: true,
        title: true,
      },
    });
    return user;
  },
  ["getAuthorByUsername"],
  {
    tags: ["getAuthorByUsername"],
    revalidate: 60 * 60 * 24, // 24 hours
  }
);
export const getAuthorPosts = unstable_cache(
  async (
    user: AuthorSelect,
    limit: number,
    page: number,
    status: NonNullable<PostInsert["status"] | "all"> = "published"
  ) => {
    const offset = limit * (page - 1);
    const _posts = await db.query.posts.findMany({
      where:
        status === "all"
          ? eq(posts.author_id, user?.auth_id as string)
          : eq(posts.status, status),
      offset: offset,
      limit: limit,
      orderBy: [desc(posts.updated_at), desc(posts?.published_at)],
      with: {
        featured_image: {
          columns: {
            url: true,
            caption: true,
            alt_text: true,
          },
        },
        category: {
          columns: {
            name: true,
            slug: true,
            id: true,
          },
        },
        author: {
          columns: {
            name: true,
            avatar: true,
            username: true,
          },
        },
      },
    });
    return _posts;
  },
  ["getAuthorPosts"],
  {
    tags: ["getAuthorPosts"],
    revalidate: 60 * 60 * 24, // 24 hours
  }
);
