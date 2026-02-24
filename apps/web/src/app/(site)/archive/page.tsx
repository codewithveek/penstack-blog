import { notFound } from "next/navigation";
import { api } from "@/lib/api-client";
import { fetchSiteContext } from "@/lib/site-context";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { mapPosts } from "@/lib/mappers";

export const revalidate = 60;

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  try {
    const [site, postsResult] = await Promise.all([
      fetchSiteContext(),
      api.getWithMeta<Record<string, unknown>[]>("/api/content/v1/posts", {
        page,
        limit: 20,
      }),
    ]);

    const posts = mapPosts(postsResult.data as Parameters<typeof mapPosts>[0]);

    return (
      <SiteRenderer
        context={{ type: "archive", posts }}
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
