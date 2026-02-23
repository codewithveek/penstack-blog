"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tagsApi } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export function TagsPage() {
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: tags, isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => tagsApi.create({ name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tags"] });
      setNewName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tagsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });

  async function handleCreate() {
    if (!newName.trim()) {
      setError("Name is required.");
      return;
    }
    setError(null);
    setCreating(true);
    try {
      await createMutation.mutateAsync(newName.trim());
    } finally {
      setCreating(false);
    }
  }

  const tagList = (tags ?? []) as Tag[];

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tags</h1>

      {/* Create form */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">New tag</h2>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleCreate();
            }}
            placeholder="Tag name"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => void handleCreate()}
            disabled={creating}
            className={cn(
              "rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition",
              creating ? "opacity-60" : "hover:bg-indigo-700"
            )}
          >
            {creating ? "Adding…" : "Add tag"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {tagList.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">
              No tags yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {tagList.map((tag) => (
                <li
                  key={tag.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {tag.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-400 font-mono">
                      /{tag.slug}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete tag "${tag.name}"?`))
                        deleteMutation.mutate(tag.id);
                    }}
                    className="text-xs text-gray-400 hover:text-red-500 transition"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
