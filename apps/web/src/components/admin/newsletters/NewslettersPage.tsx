"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { newslettersApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

interface Newsletter {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  senderName: string;
  senderEmail: string;
  subscriberCount: number;
  createdAt: string;
}

export function NewslettersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["newsletters", page],
    queryFn: () => newslettersApi.list({ page, limit: 20 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newslettersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["newsletters"] }),
  });

  const newsletters = (data?.items ?? []) as Newsletter[];
  const meta = data?.meta as { total: number; pages: number } | undefined;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletters</h1>
          {meta && (
            <p className="text-sm text-gray-500">{meta.total} newsletters</p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          New newsletter
        </button>
      </div>

      {showCreate && (
        <CreateNewsletterForm
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            void qc.invalidateQueries({ queryKey: ["newsletters"] });
          }}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : newsletters.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium">No newsletters yet</p>
          <p className="text-sm mt-1">
            Create your first newsletter to start sending emails.
          </p>
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
                  Status
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Subscribers
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Sender
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">
                  Created
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {newsletters.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{n.name}</p>
                      <p className="text-xs text-gray-400">{n.slug}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${n.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {n.subscriberCount}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {n.senderName} &lt;{n.senderEmail}&gt;
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {formatDate(n.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${n.name}"?`)) {
                          deleteMutation.mutate(n.id);
                        }
                      }}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded text-sm ${page === p ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Create Newsletter Form ─────────────────────────── */

function CreateNewsletterForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      newslettersApi.create({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: description || undefined,
        senderName,
        senderEmail,
      }),
    onSuccess: onCreated,
  });

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">New Newsletter</h2>
        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Weekly Digest"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="weekly-digest"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of this newsletter"
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Sender name
          </label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Sender email
          </label>
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="newsletter@yoursite.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        onClick={() => createMutation.mutate()}
        disabled={createMutation.isPending || !name || !senderEmail}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {createMutation.isPending ? "Creating…" : "Create newsletter"}
      </button>

      {createMutation.isError && (
        <p className="text-sm text-red-600">
          Failed to create newsletter. Please try again.
        </p>
      )}
    </div>
  );
}
