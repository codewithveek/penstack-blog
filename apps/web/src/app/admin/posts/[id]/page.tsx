import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/posts/PostEditor";

export const metadata: Metadata = { title: "Edit Post" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostEditor postId={id} />;
}
