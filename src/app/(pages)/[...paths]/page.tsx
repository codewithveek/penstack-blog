import { notFound } from "next/navigation";

import BlogPage from "@/components/blog";

import {
  shortenText,
  stripHtml,
  decodeAndSanitizeHtml,
  objectToQueryParams,
  generatePostDescription,
} from "@/utils";
import { ResolvingMetadata, Metadata } from "next";
import { getSiteUrl } from "@/utils/url";
import { getData } from "@/utils/post";
import { getSettings } from "@/lib/queries/settings";
import { format } from "date-fns";
import isEmpty from "just-is-empty";
interface PageProps {
  params: {
    paths?: string[];
  };
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const path = params.paths?.join("/") || "";
  const firstSegment = params.paths?.[0] || "";
  const siteSettings = await getSettings();
  const post = await getData(path, firstSegment);

  if (post) {
    return {
      title: post?.seoMeta?.title || post?.title,
      description: post?.seoMeta?.description || generatePostDescription(post),
      creator: post?.author?.name,
      alternates: {
        canonical: post?.seoMeta?.canonical_url || `${getSiteUrl()}/${path}`,
      },
      keywords: isEmpty(post?.seoMeta?.keywords)
        ? post?.tags?.map((tag) => tag.name)
        : post?.seoMeta?.keywords,
      authors: [
        {
          name: post?.author?.name,
          url: `${getSiteUrl()}/author/${post?.author?.username}`,
        },
      ],
      category: post?.category?.name,

      openGraph: {
        publishedTime: format(
          new Date(post?.published_at || (post?.created_at as Date)),
          "yyyy-MM-dd"
        ),
        modifiedTime: format(
          new Date(post?.updated_at || (post?.published_at as Date)),
          "yyyy-MM-dd"
        ),
        url: `${getSiteUrl()}/${path}`,
        title: post?.seoMeta?.title || post?.title,
        description:
          post?.seoMeta?.description || generatePostDescription(post),
        siteName: siteSettings.siteName.value,
        tags: isEmpty(post?.seoMeta?.keywords)
          ? post?.tags?.map((tag) => tag.name)
          : post?.seoMeta?.keywords,
        images: [
          {
            url:
              post?.seoMeta?.image ||
              post?.featured_image?.url ||
              `/api/og?${objectToQueryParams({
                title: post?.title,
                date: post?.published_at
                  ? post?.published_at
                  : post?.created_at,
                avatar: post?.author?.avatar,
                name: post?.author?.name,
                category: post?.category?.name,
                readingTime: post?.reading_time,
              })}`,
            width: 1200,
            height: 630,
          },
        ],
        locale: "en_US",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title:
          post?.seoMeta?.title || `${post?.title} - ${post?.category?.name}`,
        description:
          post?.seoMeta?.description || `${generatePostDescription(post)}`,
      },
      robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
        noimageindex: false,
        nositelinkssearchbox: false,
      },
    };
  }
  return {};
}
export default async function DynamicPage({ params }: PageProps) {
  const path = params.paths?.join("/") || "";
  const firstSegment = params.paths?.[0] || "";
  const siteSettings = await getSettings();

  // Skip processing if this is a known Next.js file route
  // This is a safety check but should rarely be needed since
  // Next.js will prioritize file-based routes over dynamic routes
  if (path.startsWith("api") || path.startsWith("_next")) {
    return null;
  }

  const post = await getData(path, firstSegment);
  if (post) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.seoMeta?.title || post.title,
      description: post.seoMeta?.description || generatePostDescription(post),
      author: {
        "@type": "Person",
        name: post.author?.name,
        url: `${getSiteUrl()}/author/${post.author?.username}`,
        image: {
          "@type": "ImageObject",
          url: post.author?.avatar,
          width: "96",
          height: "96",
        },
      },
      datePublished: post.published_at || post.updated_at,
      dateModified: post.updated_at || post.published_at,
      image:
        post.seoMeta?.image ||
        post.featured_image?.url ||
        `${getSiteUrl()}/api/og?${objectToQueryParams({
          title: post.seoMeta?.title || post.title,
          date: post.published_at || post.updated_at,
        })}`,

      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${getSiteUrl()}/${path}`,
      },
      publisher: {
        "@type": "Organization",
        name: siteSettings.siteName.value,
        logo: {
          "@type": "ImageObject",
          url: siteSettings.siteLogo.value,
          width: "300",
          height: "300",
        },
      },
      articleBody: stripHtml(decodeAndSanitizeHtml(post.content || "")),
      keywords: isEmpty(post.seoMeta?.keywords)
        ? post.tags?.map((tag) => tag.name)
        : post.seoMeta?.keywords,
      articleSection: post.category?.name,
      wordCount: post.reading_time ? post.reading_time * 200 : undefined, // Rough estimate based on reading time
    };
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BlogPage post={post} siteSettings={siteSettings} />
      </>
    );
  }

  // If no blog post is found, you have two options:
  // 1. Return 404 (this is what we're doing here)
  // 2. Fall back to a file-based page if one exists at this path
  //    (though Next.js should handle this automatically)
  return notFound();
}
