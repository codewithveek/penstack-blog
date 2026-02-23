import { notFound } from "next/navigation";
import type { ThemePageProps, ThemePostContext, ThemeTagContext } from "@cms/core/types/theme";
import { api } from "@/lib/api-client";
import { SiteRenderer } from "@/components/site/SiteRenderer";

export const revalidate = 60;

interface TagData {
  site: ThemePageProps["site"];
  tag: ThemeTagContext;
  posts: ThemePostContext[];
  pagination: ThemePageProps["pagination"];
}

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

  let data: TagData;
  try {
    data = await api.get<TagData>(`/api/content/v1/tags/${slug}`, {
      page,
      limit: 15,
    });
  } catch {
    notFound();
  }

  return (
    <SiteRenderer
      context={{ type: "tag", tag: data.tag, posts: data.posts }}
      site={data.site}
      pagination={data.pagination}
    />
  );
}
