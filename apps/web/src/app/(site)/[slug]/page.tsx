import { notFound } from "next/navigation";
import type { ThemePageProps } from "@cms/core/types/theme";
import { api } from "@/lib/api-client";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { headers } from "next/headers";

// Post pages are ISR. Member-gated posts use dynamic rendering per the AGENTS.md rule.
export const revalidate = 60;

interface PostData {
  site: ThemePageProps["site"];
  post: unknown;
  isPage: boolean;
  visibility: string;
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data: PostData;
  try {
    data = await api.get<PostData>(`/api/content/v1/posts/${slug}`);
  } catch {
    // Try as a static page
    try {
      data = await api.get<PostData>(`/api/content/v1/posts/${slug}?type=page`);
    } catch {
      notFound();
    }
  }

  // Member-gated: force dynamic rendering
  if (data.visibility === "members" || data.visibility === "paid") {
    const hdrs = await headers();
    const memberSession = hdrs.get("x-member-session");
    if (!memberSession) {
      // Still render but MembersGate component in the theme will handle the paywall
    }
  }

  return (
    <SiteRenderer
      context={
        data.isPage
          ? { type: "page", post: data.post }
          : { type: "post", post: data.post }
      }
      site={data.site}
    />
  );
}
