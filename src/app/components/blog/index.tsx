import PostPage from "@/components//pages/PostPage";

import { PostSelect, SiteSettings } from "@/types";

export default function BlogPage({
  post,
  siteSettings,
}: {
  post: PostSelect;
  siteSettings: SiteSettings;
}) {
  return (
    <>
      <PostPage post={post as any} siteSettings={siteSettings} />;
    </>
  );
}
