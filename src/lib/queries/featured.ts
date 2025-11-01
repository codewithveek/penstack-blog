import "server-only";
import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/mysql-core";
import {
  posts,
  postReactions,
  comments,
  replies,
  categories,
  tags,
  postTags,
  reactionTypes,
} from "../../db/schemas";
import { db } from "@/db";

// Helper function to get base published posts query
export const getPublishedPostsQuery = () => {
  return and(
    eq(posts.status, "published"),
    eq(posts.visibility, "public"),
    sql`${posts.published_at} IS NOT NULL`
  );
};

// 1. Engagement-based featuring
export const getEngagementBasedFeaturedPosts = async (
  db: any,
  daysAgo = 1,
  limit = 10
) => {
  try {
    const subQuery = await db
      .select({
        postId: posts.id,
        reactionCount: sql<number>`COUNT(DISTINCT ${postReactions.id})`,
        commentCount: sql<number>`COUNT(DISTINCT ${comments.id})`,
        engagementScore: sql<number>`
        (COUNT(DISTINCT ${postReactions.id}) + (COUNT(DISTINCT ${comments.id}) * 2)) /
        GREATEST(TIMESTAMPDIFF(HOUR, ${posts.published_at}, NOW()), 1)
      `,
      })
      .from(posts)
      .leftJoin(postReactions, eq(posts.id, postReactions.post_id))
      .leftJoin(
        comments,
        and(eq(posts.id, comments.post_id), eq(comments.status, "approved"))
      )
      .where(
        and(
          getPublishedPostsQuery(),
          gt(posts.published_at, sql`DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY)`)
        )
      )
      .groupBy(posts.id);

    const result = await db
      .select({
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        content: posts.content,
        publishedAt: posts.published_at,
        isSticky: posts.is_sticky,
        engagementScore: subQuery.engagementScore,
        reactionCount: subQuery.reactionCount,
        commentCount: subQuery.commentCount,
      })
      .from(posts)
      .orderBy(desc(posts.is_sticky), desc(subQuery.engagementScore))
      .limit(limit);

    return result;
  } catch (error) {
    throw error;
  }
};

// 2. Category-based featuring with rotation
export const getCategoryBasedFeaturedPosts = async (
  db: any,
  postsPerCategory = 2
) => {
  const postWithRank = alias(posts, "postWithRank");

  return await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      categoryName: categories.name,
      publishedAt: posts.published_at,
      categoryRank: sql<number>`
        ROW_NUMBER() OVER (
          PARTITION BY ${posts.category_id}
          ORDER BY ${posts.published_at} DESC,
          (SELECT COUNT(*) FROM ${postReactions} WHERE ${postReactions.post_id} = ${posts.id}) DESC
        )
      `.as("categoryRank"),
    })
    .from(posts)
    .innerJoin(categories, eq(posts.category_id, categories.id))
    .where(getPublishedPostsQuery())
    .having(sql`categoryRank <= ${postsPerCategory}`);
};

// 3. Reaction-weighted featuring
export const getReactionWeightedFeaturedPosts = async (
  db: any,
  daysAgo = 30,
  limit = 5
) => {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      totalReactions: sql<number>`COUNT(DISTINCT ${postReactions.id})`,
      weightedScore: sql<number>`
        SUM(CASE 
          WHEN ${reactionTypes.name} = 'love' THEN 3
          WHEN ${reactionTypes.name} = 'like' THEN 1
          WHEN ${reactionTypes.name} = 'celebrate' THEN 2
          ELSE 1
        END)
      `,
    })
    .from(posts)
    .leftJoin(postReactions, eq(posts.id, postReactions.post_id))
    .leftJoin(
      reactionTypes,
      eq(postReactions.reaction_type_id, reactionTypes.id)
    )
    .where(
      and(
        getPublishedPostsQuery(),
        gt(posts.published_at, sql`DATE_SUB(NOW(), INTERVAL ${daysAgo} DAY)`)
      )
    )
    .groupBy(posts.id, posts.title, posts.slug)
    .having(gt(sql`COUNT(DISTINCT ${postReactions.id})`, 0))
    .orderBy(desc(sql`weightedScore`))
    .limit(limit);
};

// 4. Combined metrics featuring
export const getCombinedMetricsFeaturedPosts = async (db: any, limit = 10) => {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      readingTime: posts.reading_time,
      isSticky: posts.is_sticky,
      reactionCount: sql<number>`COUNT(DISTINCT ${postReactions.id})`,
      commentCount: sql<number>`COUNT(DISTINCT ${comments.id})`,
      replyCount: sql<number>`COUNT(DISTINCT ${replies.id})`,
      timeFactor: sql<number>`EXP(-TIMESTAMPDIFF(HOUR, ${posts.published_at}, NOW())/168)`,
      featureScore: sql<number>`
        (COUNT(DISTINCT ${postReactions.id}) + 
         (COUNT(DISTINCT ${comments.id}) * 2) + 
         (COUNT(DISTINCT ${replies.id}) * 1.5)) * 
        EXP(-TIMESTAMPDIFF(HOUR, ${posts.published_at}, NOW())/168)
      `,
    })
    .from(posts)
    .leftJoin(postReactions, eq(posts.id, postReactions.post_id))
    .leftJoin(
      comments,
      and(eq(posts.id, comments.post_id), eq(comments.status, "approved"))
    )
    .leftJoin(
      replies,
      and(eq(comments.id, replies.comment_id), eq(replies.status, "approved"))
    )
    .where(getPublishedPostsQuery())
    .groupBy(
      posts.id,
      posts.title,
      posts.slug,
      posts.reading_time,
      posts.is_sticky
    )
    .orderBy(desc(posts.is_sticky), desc(sql`featureScore`))
    .limit(limit);
};

// 5. Tag-based featuring
export const getTagBasedFeaturedPosts = async (db: any, limit = 5) => {
  const popularTags = db
    .select({
      tagId: tags.id,
      usageCount: sql<number>`COUNT(DISTINCT ${postTags.post_id})`,
    })
    .from(tags)
    .innerJoin(postTags, eq(tags.id, postTags.tag_id))
    .groupBy(tags.id)
    .orderBy(desc(sql`usageCount`))
    .limit(10)
    .as("popularTags");

  return await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      publishedAt: posts.published_at,
      popularTagCount: sql<number>`COUNT(DISTINCT ${tags.id})`,
    })
    .from(posts)
    .innerJoin(postTags, eq(posts.id, postTags.post_id))
    .innerJoin(tags, eq(postTags.tag_id, tags.id))
    .innerJoin(popularTags, eq(tags.id, popularTags.tagId))
    .where(getPublishedPostsQuery())
    .groupBy(posts.id, posts.title, posts.slug, posts.published_at)
    .orderBy(desc(sql`popularTagCount`), desc(posts.published_at))
    .limit(limit);
};

// Usage example:
export const getFeaturedPosts = async (db: any) => {
  const [
    engagementBased,
    categoryBased,
    reactionWeighted,
    combinedMetrics,
    tagBased,
  ] = await Promise.all([
    getEngagementBasedFeaturedPosts(db),
    getCategoryBasedFeaturedPosts(db),
    getReactionWeightedFeaturedPosts(db),
    getCombinedMetricsFeaturedPosts(db),
    getTagBasedFeaturedPosts(db),
  ]);

  return {
    engagementBased,
    categoryBased,
    reactionWeighted,
    combinedMetrics,
    tagBased,
  };
};
export const getFeaturedPost = async () => {
  try {
    const featuredPost = await db.query.posts.findFirst({
      where: getPublishedPostsQuery(),
      orderBy: [desc(posts.content)],
      columns: {
        author_id: false,
      },
      with: {
        featured_image: {
          columns: {
            url: true,
            alt_text: true,
            id: true,
            caption: true,
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
            username: true,
            id: true,

            avatar: true,
          },
        },
        tags: {
          with: {
            tag: {
              columns: {
                name: true,
                slug: true,
                id: true,
              },
            },
          },
        },
      },
    });
    const tags = featuredPost?.tags.map((t) => t.tag);

    const post = {
      ...featuredPost,
      tags,
    };

    return post;
  } catch (error) {
    console.error("Error fetching featured post:", error);
    throw new Error("Failed to fetch featured post");
  }
};
