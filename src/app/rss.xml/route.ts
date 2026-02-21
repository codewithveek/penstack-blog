import { getPosts } from "@/src/lib/queries/posts";
import { getSettings } from "@/src/lib/queries/settings";
import { generatePostUrl } from "@/src/utils";
import { getSiteUrl } from "@/src/utils/url";
import { NextResponse } from "next/server";

export const revalidate = 3600; // rebuild at most once per hour

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const [{ data: posts }, settings] = await Promise.all([
      getPosts({
        limit: 50,
        status: "published",
        sortBy: "published_at",
        sortOrder: "desc",
      }),
      getSettings(),
    ]);

    const siteUrl = getSiteUrl();
    const siteName = escapeXml(settings.siteName?.value || "Penstack");
    const siteDescription = escapeXml(
      settings.siteDescription?.value || ""
    );

    const items = posts
      .map((post) => {
        const postUrl = generatePostUrl(post as any);
        const pubDate = new Date(
          (post as any).published_at || post.created_at!
        ).toUTCString();
        const title = escapeXml(post.title || "");
        const description = post.summary ? escapeXml(post.summary) : "";
        const authorName = post.author?.name
          ? escapeXml(post.author.name)
          : "";
        const categoryName = post.category?.name
          ? escapeXml(post.category.name)
          : "";
        const tagItems = ((post.tags as Array<{ name: string }>) || [])
          .map((t) => `      <category>${escapeXml(t.name)}</category>`)
          .join("\n");

        return `  <item>
    <title>${title}</title>
    <link>${postUrl}</link>
    <guid isPermaLink="true">${postUrl}</guid>
    <pubDate>${pubDate}</pubDate>${
      description ? `\n    <description>${description}</description>` : ""
    }${authorName ? `\n    <author>${authorName}</author>` : ""}${
      categoryName
        ? `\n    <category>${categoryName}</category>`
        : ""
    }${tagItems ? `\n${tagItems}` : ""}
  </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteName}</title>
    <link>${siteUrl}</link>
    <description>${siteDescription}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("RSS feed generation failed:", error);
    return new NextResponse("Failed to generate RSS feed", { status: 500 });
  }
}
