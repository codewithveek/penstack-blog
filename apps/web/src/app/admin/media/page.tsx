import type { Metadata } from "next";
import { MediaLibraryPage } from "@/components/admin/media/MediaLibraryPage";

export const metadata: Metadata = { title: "Media" };

export default function AdminMediaPage() {
  return <MediaLibraryPage />;
}
