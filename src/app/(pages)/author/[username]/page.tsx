import AuthorPage from "@/components//pages/AuthorPage";
import { getAuthorByUsername, getAuthorPosts } from "@/lib/queries/author";
import { getSettings } from "@/lib/queries/settings";
import { PostSelect } from "@/types";
import { getSiteUrl } from "@/utils/url";
import { type Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const { username } = params;

  const author = await getAuthorByUsername(username);
  const authorName = author?.name;

  return {
    title: `Articles and Posts by ${authorName}`,
    description: `Explore our collection of articles and posts by ${authorName} . Find expert insights, tutorials, and in-depth content.`,
    keywords: [
      `${authorName}`,
      "blog",
      "articles",
      "tech blog",
      "tech articles",
      "tech posts",
      "tech news",
    ],
    openGraph: {
      title: `Articles and Posts by ${authorName}`,
      description: `Discover articles and posts by ${authorName}. Expert insights and in-depth content.`,
      type: "website",
      images: [
        {
          url: `/api/og?title=${authorName} - Articles and Posts`,
          width: 1200,
          height: 630,
          alt: `${authorName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Articles and Posts by ${authorName}`,
      description: `Discover articles and posts by ${authorName}. Expert insights and in-depth content.`,
    },
  };
}
export default async function MainAuthorPage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const siteSettings = await getSettings();
  const author = await getAuthorByUsername(username);
  if (!author) {
    return notFound();
  }
  const posts = (await getAuthorPosts(
    author,
    10,
    1,
    "published"
  )) as PostSelect[];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    description: author.bio,
    url: `${getSiteUrl()}/author/${author.username}`,
    worksFor: {
      "@type": "Organization",
      name: siteSettings.siteName.value,
      url: getSiteUrl(),
    },
    jobTitle: author.title,
    image: {
      "@type": "ImageObject",
      url: author.avatar,
      width: "96",
      height: "96",
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuthorPage username={username} author={author} posts={posts} />
    </>
  );
}
