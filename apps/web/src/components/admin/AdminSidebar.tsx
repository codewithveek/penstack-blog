"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "⊞" },
  { label: "Posts", href: "/admin/posts", icon: "✎" },
  { label: "Pages", href: "/admin/pages", icon: "☰" },
  { label: "Tags", href: "/admin/tags", icon: "⌗" },
  { label: "Members", href: "/admin/members", icon: "♟" },
  { label: "Media", href: "/admin/media", icon: "⊡" },
  { label: "Settings", href: "/admin/settings", icon: "⚙" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await authApi.adminLogout().catch(() => null);
    logout();
    router.replace("/admin/login");
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b border-gray-100">
        <span className="text-lg font-bold text-indigo-600">PenStack</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
            {user?.name.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => void handleLogout()}
            className="text-xs text-gray-400 hover:text-red-500 transition"
            title="Sign out"
          >
            ⎋
          </button>
        </div>
      </div>
    </aside>
  );
}
