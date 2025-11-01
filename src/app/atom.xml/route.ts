import { getPostsForRss } from "@/lib/queries/posts";
import {
  decodeAndSanitizeHtml,
  generatePostDescription,
  generatePostUrl,
} from "@/utils";
import { NextResponse } from "next/server";
import { Feed } from "feed";
import { getSettings } from "@/lib/queries/settings";
import { getSiteUrl } from "@/utils/url";

export async function GET() {
  const posts = await getPostsForRss();
  const siteSettings = await getSettings();
  const feed = new Feed({
    favicon: siteSettings.siteFavicon?.value || "",
    title: siteSettings.siteTitle?.value,
    description: siteSettings.siteDescription.value,
    image: siteSettings.siteLogo?.value || "",
    id: getSiteUrl(),
    link: getSiteUrl(),
    language: "en",
    copyright: `All rights reserved ${siteSettings.siteName?.value} - ${new Date().getFullYear()}`,
    feedLinks: {
      rss2: `${getSiteUrl()}/feed`,
      atom: `${getSiteUrl()}/atom.xml`,
    },
    author: {
      name: siteSettings.siteName.value,
      email: siteSettings.emailFrom.value,
      link: getSiteUrl(),
    },
  });
  posts.data.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: generatePostUrl(post as any),
      link: generatePostUrl(post as any),
      description: generatePostDescription(post as any),
      published: new Date(post.published_at as Date),
      date: new Date(post.published_at as Date),
      content: decodeAndSanitizeHtml(post.content || ""),
      author: [
        {
          name: post.author.name,
          email: post.author.email,
          link: getSiteUrl() + "/author/" + post.author.username,
          avatar: post.author.avatar || undefined,
        },
      ],
      category: post.category?.name ? [{ name: post.category.name }] : [],
      image: post.featured_image?.url || "",
      enclosure: {
        url: post.featured_image?.url || "",
        type: "image/jpeg",
      },
    });
  });
  return new NextResponse(feed.atom1(), {
    headers: {
      "Content-Type": "application/atom+xml",
    },
  });
}
