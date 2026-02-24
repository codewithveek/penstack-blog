import { notFound } from "next/navigation";
import type { ThemePostContext, ThemeAuthorContext } from "@cms/core/types/theme";
import { api } from "@/lib/api-client";
import { fetchSiteContext } from "@/lib/site-context";
import { SiteRenderer } from "@/components/site/SiteRenderer";

export const revalidate = 60;

export default async function AuthorPage({
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
    const [site, author] = await Promise.all([
      fetchSiteContext(),
      api.get<ThemeAuthorContext>(`/api/content/v1/authors/${slug}`),
    ]);

    // Fetch that author's posts (may need a separate endpoint; for now use general posts)
    const postsResult = await api.getWithMeta<ThemePostContext[]>(
      "/api/content/v1/posts",
      { page, limit: 15 }
    );

    return (
      <SiteRenderer
        context={{ type: "author", author, posts: postsResult.data }}
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
