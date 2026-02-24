import { notFound } from "next/navigation";
import { api } from "@/lib/api-client";
import { fetchSiteContext } from "@/lib/site-context";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { mapPosts, mapTag } from "@/lib/mappers";

export const revalidate = 60;

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  try {
    const [site, rawTag] = await Promise.all([
      fetchSiteContext(),
      api.get<Record<string, unknown>>(`/api/content/v1/tags/${slug}`),
    ]);

    const tag = mapTag(rawTag as Parameters<typeof mapTag>[0]);

    // Fetch posts for this tag
    const postsResult = await api.getWithMeta<Record<string, unknown>[]>(
      "/api/content/v1/posts",
      { page, limit: 15, tag: slug }
    );

    const posts = mapPosts(postsResult.data as Parameters<typeof mapPosts>[0]);

    return (
      <SiteRenderer
        context={{ type: "tag", tag, posts }}
        site={site}
        pagination={{
          page: postsResult.meta.page,
          pages: postsResult.meta.pages,
          total: postsResult.meta.total,
          limit: postsResult.meta.limit,
          hasPrev: postsResult.meta.page > 1,
          hasNext: postsResult.meta.page < postsResult.meta.pages,
        }}
      />
    );
  } catch {
    notFound();
  }
}
