import { db } from "@/src/db";
import { categories, posts, tags } from "@/src/db/schemas";
import { generatePostUrl } from "@/src/utils";
import { getSiteUrl } from "@/src/utils/url";
import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const [publishedPosts, allCategories, allTags] = await Promise.all([
    db.query.posts.findMany({
      where: eq(posts.status, "published"),
      columns: {
        slug: true,
        updated_at: true,
        published_at: true,
        category_id: true,
      },
      with: {
        category: { columns: { slug: true } },
        tags: { with: { tag: { columns: { slug: true } } } },
      },
    }),
    db.query.categories.findMany({
      columns: { slug: true, updated_at: true },
    }),
    db.query.tags.findMany({
      columns: { slug: true, updated_at: true },
    }),
  ]);

  const postUrls: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: generatePostUrl(post as any),
    lastModified: post.updated_at ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = allCategories.map((cat) => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: cat.updated_at ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const tagUrls: MetadataRoute.Sitemap = allTags.map((tag) => ({
    url: `${siteUrl}/tags/${tag.slug}`,
    lastModified: tag.updated_at ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...postUrls,
    ...categoryUrls,
    ...tagUrls,
  ];
}
