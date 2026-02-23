import type { Metadata } from "next";
import { TagsPage } from "@/components/admin/tags/TagsPage";

export const metadata: Metadata = { title: "Tags" };

export default function AdminTagsPage() {
  return <TagsPage />;
}
