import type { Metadata } from "next";
import { NewslettersPage } from "@/components/admin/newsletters/NewslettersPage";

export const metadata: Metadata = { title: "Newsletters" };

export default function AdminNewslettersPage() {
  return <NewslettersPage />;
}
