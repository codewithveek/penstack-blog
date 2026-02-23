"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pagesApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  createdAt: string;
}

export function PagesListPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["pages", page],
    queryFn: () => pagesApi.list({ page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pagesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pages"] }),
  });

  const pages = (data?.items ?? []) as Page[];
  const meta = data?.meta as { total: number; pages: number } | undefined;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
        >
          + New page
        </Link>
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
                  Title
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Slug
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Created
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/pages/${p.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {p.title || (
                        <span className="text-gray-400 italic">Untitled</span>
                      )}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                    /{p.slug}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm("Delete this page?"))
                          deleteMutation.mutate(p.id);
                      }}
                      className="text-xs text-gray-400 hover:text-red-500 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pages.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-12">
              No pages yet.
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
