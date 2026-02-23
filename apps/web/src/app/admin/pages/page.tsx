import type { Metadata } from "next";
import { PagesListPage } from "@/components/admin/pages/PagesListPage";

export const metadata: Metadata = { title: "Pages" };

export default function AdminPagesPage() {
  return <PagesListPage />;
}
