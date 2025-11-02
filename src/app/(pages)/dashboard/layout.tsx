import { ReactNode } from "react";
import DashboardLayout from "@/components/pages/Dashboard/Layout";
import { getSession } from "@/lib/auth/next-auth";
import { getDashboardNavigation } from "@/lib/dashboard/nav-links";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
    noimageindex: true,
  },
};
export default async function DashLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  const permissions = session?.user?.permissions!;

  const navLinks = getDashboardNavigation(permissions);
  return <DashboardLayout navLinks={navLinks}>{children}</DashboardLayout>;
}
