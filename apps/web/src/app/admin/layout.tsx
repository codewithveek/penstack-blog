import type { Metadata } from "next";
import { AdminChakraProvider } from "@/components/admin/AdminChakraProvider";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { template: "%s — PenStack Admin", default: "Dashboard" },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminChakraProvider>
      <AdminAuthGuard>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </AdminAuthGuard>
    </AdminChakraProvider>
  );
}
