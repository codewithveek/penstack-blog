import { notFound } from "next/navigation";
import { api } from "@/lib/api-client";
import { fetchSiteContext } from "@/lib/site-context";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { mapPost } from "@/lib/mappers";
import { headers } from "next/headers";

// Post pages are ISR. Member-gated posts use dynamic rendering per the AGENTS.md rule.
export const revalidate = 60;

export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let rawPost: Record<string, unknown>;
  let isPage = false;

  try {
    // Try fetching by slug — the content handler returns matching post/page
    rawPost = await api.get<Record<string, unknown>>(
      `/api/content/v1/posts/slug/${slug}`
    );
    isPage = rawPost.type === "page";
  } catch {
    // Try as a page via the pages endpoint
    try {
      rawPost = await api.get<Record<string, unknown>>(
        `/api/content/v1/pages/${slug}`
      );
      isPage = true;
    } catch {
      notFound();
    }
  }

  const post = mapPost(rawPost as Parameters<typeof mapPost>[0]);

  // Member-gated: force dynamic rendering
  if (post.visibility === "members" || post.visibility === "paid") {
    const hdrs = await headers();
    const memberSession = hdrs.get("x-member-session");
    if (!memberSession) {
      // Still render but MembersGate component in the theme will handle the paywall
    }
  }

  const site = await fetchSiteContext();

  return (
    <SiteRenderer
      context={
        isPage
          ? { type: "page", post }
          : { type: "post", post }
      }
      site={site}
    />
  );
}
