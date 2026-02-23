import { notFound } from "next/navigation";
import type { ThemePageProps } from "@cms/core/types/theme";
import { api } from "@/lib/api-client";
import { SiteRenderer } from "@/components/site/SiteRenderer";

export const revalidate = 60;

interface AuthorData {
  site: ThemePageProps["site"];
  author: unknown;
  posts: unknown[];
  pagination: ThemePageProps["pagination"];
}

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

  let data: AuthorData;
  try {
    data = await api.get<AuthorData>(`/api/content/v1/authors/${slug}`, {
      page,
      limit: 15,
    });
  } catch {
    notFound();
  }

  return (
    <SiteRenderer
      context={{ type: "author", author: data.author, posts: data.posts }}
      site={data.site}
      pagination={data.pagination}
    />
  );
}
