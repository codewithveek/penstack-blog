import type { Metadata } from "next";
import { MemberPortal } from "@/components/site/MemberPortal";

export const metadata: Metadata = { title: "Member Portal" };

export default function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return <MemberPortal searchParamsPromise={searchParams} />;
}
