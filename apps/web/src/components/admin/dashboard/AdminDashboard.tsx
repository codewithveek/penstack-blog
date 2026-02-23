"use client";

import { useQuery } from "@tanstack/react-query";
import { postsApi, membersApi } from "@/lib/api-client";
import { formatNumber } from "@/lib/utils";

export function AdminDashboard() {
  const { data: posts } = useQuery({
    queryKey: ["posts", "stats"],
    queryFn: () => postsApi.list({ limit: 1, status: "published" }),
  });

  const { data: members } = useQuery({
    queryKey: ["members", "stats"],
    queryFn: () => membersApi.list({ limit: 1 }),
  });

  const stats = [
    {
      label: "Published posts",
      value: (posts?.meta as { total?: number } | undefined)?.total ?? 0,
    },
    {
      label: "Total members",
      value: (members?.meta as { total?: number } | undefined)?.total ?? 0,
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {formatNumber(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
