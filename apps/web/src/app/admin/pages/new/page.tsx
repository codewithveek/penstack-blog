import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/posts/PostEditor";

export const metadata: Metadata = { title: "New Page" };

// Pages share the same editor UI as posts — the backend differentiates them by type.
export default function NewPagePage() {
  return <PostEditor />;
}
