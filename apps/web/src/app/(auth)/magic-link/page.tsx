import type { Metadata } from "next";
import { MagicLinkVerify } from "@/components/auth/MagicLinkVerify";

export const metadata: Metadata = { title: "Verify Login Link" };

export default function MagicLinkPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <MagicLinkVerify />
    </main>
  );
}
