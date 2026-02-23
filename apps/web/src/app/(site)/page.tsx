import { notFound } from "next/navigation";
import type { ThemePageProps, ThemePostContext } from "@cms/core/types/theme";
import { api } from "@/lib/api-client";
import { SiteRenderer } from "@/components/site/SiteRenderer";

export const revalidate = 60;

interface IndexData {
  site: ThemePageProps["site"];
  posts: ThemePostContext[];
  pagination: ThemePageProps["pagination"];
}

export default async function SiteIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam, 10) : 1;

  let data: IndexData;
  try {
    data = await api.get<IndexData>("/api/content/v1/posts", {
      page,
      limit: 15,
    });
  } catch {
    notFound();
  }

  return (
    <SiteRenderer
      context={{
        type: "index",
        posts: data.posts,
      }}
      site={data.site}
      pagination={data.pagination}
    />
  );
}
