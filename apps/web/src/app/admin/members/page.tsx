import type { Metadata } from "next";
import { MembersPage } from "@/components/admin/members/MembersPage";

export const metadata: Metadata = { title: "Members" };

export default function AdminMembersPage() {
  return <MembersPage />;
}
