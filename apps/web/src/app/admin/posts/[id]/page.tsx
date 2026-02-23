import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/posts/PostEditor";

export const metadata: Metadata = { title: "Edit Post" };

export default function EditPostPage({ params }: { params: { id: string } }) {
  return <PostEditor postId={params.id} />;
}
