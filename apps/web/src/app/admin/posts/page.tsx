import type { Metadata } from "next";
import { PostsListPage } from "@/components/admin/posts/PostsListPage";

export const metadata: Metadata = { title: "Posts" };

export default function AdminPostsPage() {
  return <PostsListPage />;
}
