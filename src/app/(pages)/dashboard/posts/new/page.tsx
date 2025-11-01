import { db } from "@/db";
import { posts } from "@/db/schemas";
import { checkPermission } from "@/lib/auth/check-permission";
import { PostSelect } from "@/types";
import { IdGenerator } from "@/utils";
import { eq, sql } from "drizzle-orm";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | New Post",
};
export default async function Page() {
  let createdPost = null;

  try {
    const shortId = IdGenerator.bigIntId().substring(0, 10);

    createdPost = (await checkPermission(
      { requiredPermission: "posts:create" },
      async (user) => {
        const newPost = {
          title: "Untitled post",
          slug: "untitled-" + shortId,
          author_id: user?.id as string,
        };
        const [insertResponse] = await db
          .insert(posts)
          .values(newPost)
          .onDuplicateKeyUpdate({
            set: {
              slug: sql`slug`,
            },
          })
          .$returningId();
        return await db.query.posts.findFirst({
          where: eq(posts.id, insertResponse.id),
        });
      },
      true
    )) as PostSelect;
  } catch (error) {
    console.error("Error creating post:", error);
    return <div>Failed to create post</div>;
  }

  if (!createdPost) {
    return <div>Failed to create post</div>;
  }

  redirect(`/dashboard/posts/new/${createdPost.post_id}`);
}
