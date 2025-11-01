import { db } from "@/db";
import { posts } from "@/db/schemas";
import { eq, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getPost = async (slugOrPostId: string | number) => {
  let orQuery = [];
  if (typeof slugOrPostId === "number") {
    orQuery.push(eq(posts.id, slugOrPostId));
  } else {
    orQuery.push(eq(posts.slug, slugOrPostId), eq(posts.post_id, slugOrPostId));
  }

  const post = await db.query.posts.findFirst({
    where: () => or(...orQuery),
    with: {
      views: {
        columns: { id: true },
      },
      featured_image: {
        columns: {
          url: true,
          alt_text: true,
          thumbnail: true,
          preview: true,
          caption: true,
        },
      },
      author: {
        columns: {
          auth_id: true,
          username: true,
          name: true,
          avatar: true,
          bio: true,
        },
      },
      category: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      seoMeta: {
        columns: {
          post_id: true,
          title: true,
          description: true,
          image: true,
          keywords: true,
          canonical_url: true,
        },
      },
      tags: {
        with: {
          tag: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });
  const tags = post?.tags?.length ? post?.tags.map((t) => t.tag) : [];

  const viewsCount = post?.views?.length;

  if (!post) return null;

  const transformedPost = { ...post, tags, views: { count: viewsCount } };
  return transformedPost;
};
export const getPostForEditing = async (slugOrPostId: string | number) => {
  let orQuery = [];
  if (typeof slugOrPostId === "number") {
    orQuery.push(eq(posts.id, slugOrPostId));
  } else {
    orQuery.push(eq(posts.slug, slugOrPostId), eq(posts.post_id, slugOrPostId));
  }

  const post = await db.query.posts.findFirst({
    where: () => or(...orQuery),
    columns: {
      published_at: false,
      created_at: false,
    },
    with: {
      featured_image: {
        columns: {
          id: true,
          url: true,
          alt_text: true,
          caption: true,
          preview: true,
          thumbnail: true,
        },
      },
      seoMeta: {
        columns: {
          post_id: true,
          title: true,
          description: true,
          image: true,
          keywords: true,
          canonical_url: true,
        },
      },
    },
  });
  return post;
};

export const getPostWithCache = unstable_cache(
  async (slugOrPostId: string | number) => {
    let orQuery = [];
    if (typeof slugOrPostId === "number") {
      orQuery.push(eq(posts.id, slugOrPostId));
    } else {
      orQuery.push(
        eq(posts.slug, slugOrPostId),
        eq(posts.post_id, slugOrPostId)
      );
    }

    const post = await db.query.posts.findFirst({
      where: () => or(...orQuery),
      with: {
        views: {
          columns: { id: true },
        },
        featured_image: {
          columns: {
            url: true,
            alt_text: true,
            caption: true,
          },
        },
        author: {
          columns: {
            username: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        category: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          with: {
            tag: {
              columns: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
    const tags = post?.tags?.length ? post?.tags.map((t) => t.tag) : [];

    const viewsCount = post?.views?.length;

    if (!post) return null;

    const transformedPost = { ...post, tags, views: { count: viewsCount } };
    return transformedPost;
  },
  undefined,
  { tags: ["getPostWithCache"], revalidate: 60 }
);

export const getPlainPost = async (slugOrPostId: string) => {
  return await db.query.posts.findFirst({
    where: or(eq(posts.slug, slugOrPostId), eq(posts.post_id, slugOrPostId)),
  });
};
export const getPlainPostWithCache = unstable_cache(
  async (slugOrPostId: string) => {
    return await db.query.posts.findFirst({
      where: or(eq(posts.slug, slugOrPostId), eq(posts.post_id, slugOrPostId)),
    });
  },
  undefined,
  { tags: ["getPlainPostWithCache"], revalidate: 60 * 60 * 24 }
);
export const getPostBySlug = async (slug: string) => {
  try {
    return await getPost(slug);
  } catch (error) {
    console.log(error);

    return null;
  }
};
