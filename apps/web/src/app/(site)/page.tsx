import { notFound } from "next/navigation";
import type { ThemePostContext } from "@cms/core/types/theme";
import { api } from "@/lib/api-client";
import { fetchSiteContext } from "@/lib/site-context";
import { SiteRenderer } from "@/components/site/SiteRenderer";

export const revalidate = 60;

export default async function SiteIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  try {
    const [site, postsResult] = await Promise.all([
      fetchSiteContext(),
      api.getWithMeta<ThemePostContext[]>("/api/content/v1/posts", {
        page,
        limit: 15,
      }),
    ]);

    return (
      <SiteRenderer
        context={{
          type: "index",
          posts: postsResult.data,
        }}
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
