"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membersApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface Member {
  id: string;
  name: string | null;
  email: string;
  status: string;
  subscriptionTier: string;
  createdAt: string;
}

export function MembersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["members", page],
    queryFn: () => membersApi.list({ page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => membersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members"] }),
  });

  const members = (data?.items ?? []) as Member[];
  const meta = data?.meta as { total: number; pages: number } | undefined;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          {meta && <p className="text-sm text-gray-500">{meta.total} total</p>}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Tier
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Joined
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {m.name ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{m.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${m.subscriptionTier === "paid" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {m.subscriptionTier}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${m.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm("Remove this member?"))
                          deleteMutation.mutate(m.id);
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 transition"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-12">
              No members yet.
            </p>
          )}
        </div>
      )}
      {meta && meta.pages > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="px-3 py-1 text-sm text-gray-500">
            {page} / {meta.pages}
          </span>
          <button
            disabled={page >= meta.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
