"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postsApi, tagsApi } from "@/lib/api-client";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { cn } from "@/lib/utils";

interface PostEditorProps {
  postId?: string;
}

interface TagOption {
  id: string;
  name: string;
  slug: string;
}
interface PostPayload {
  title: string;
  lexical: object;
  status?: string;
  excerpt?: string;
  featureImage?: string;
  tagIds?: string[];
}

export function PostEditor({ postId }: PostEditorProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const isNew = !postId;

  const { data: existing } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => postsApi.get(postId!),
    enabled: !isNew,
  });

  const { data: allTags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsApi.list(),
  });

  const post = existing as
    | {
        title?: string;
        lexical?: object;
        excerpt?: string;
        featureImage?: string;
        status?: string;
        tags?: { id: string }[];
      }
    | undefined;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<object>({});
  const [excerpt, setExcerpt] = useState("");
  const [featureImage, setFeatureImage] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Populate form from loaded post
  useEffect(() => {
    if (post) {
      setTitle(post.title ?? "");
      if (post.lexical) setContent(post.lexical);
      setExcerpt(post.excerpt ?? "");
      setFeatureImage(post.featureImage ?? "");
      setSelectedTagIds((post.tags ?? []).map((t) => t.id));
    }
  }, [post]);

  const saveMutation = useMutation({
    mutationFn: (data: PostPayload) =>
      isNew ? postsApi.create(data) : postsApi.update(postId!, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      setLastSaved(new Date().toLocaleTimeString());
      if (isNew) {
        const created = updated as { id: string };
        router.replace(`/admin/posts/${created.id}`);
      }
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => postsApi.publish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["post", postId] }),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) => postsApi.unpublish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["post", postId] }),
  });

  // Autosave: debounced save on changes (only for existing posts)
  const handleContentChange = useCallback((json: object) => {
    setContent(json);
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await saveMutation.mutateAsync({
        title,
        lexical: content,
        excerpt,
        featureImage,
        tagIds: selectedTagIds,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!postId) {
      // Save first, then publish
      await handleSave();
      return;
    }
    setPublishing(true);
    try {
      const currentStatus = post?.status;
      if (currentStatus === "published") {
        await unpublishMutation.mutateAsync(postId);
      } else {
        // Save draft first
        await saveMutation.mutateAsync({
          title,
          lexical: content,
          excerpt,
          featureImage,
          tagIds: selectedTagIds,
        });
        await publishMutation.mutateAsync(postId);
      }
    } finally {
      setPublishing(false);
    }
  }

  const isPublished = post?.status === "published";
  const tags = (allTags ?? []) as TagOption[];

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <button
          onClick={() => router.push("/admin/posts")}
          className="text-sm text-gray-500 hover:text-gray-900 transition"
        >
          ← Posts
        </button>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-gray-400">Saved {lastSaved}</span>
          )}
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            onClick={() => void handlePublish()}
            disabled={publishing}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50 transition",
              isPublished
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-indigo-600 hover:bg-indigo-700"
            )}
          >
            {publishing ? "…" : isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor area */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <input
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-6 w-full text-4xl font-bold text-gray-900 outline-none placeholder-gray-300 bg-transparent"
          />
          <RichTextEditor content={content} onChange={handleContentChange} />
        </div>

        {/* Sidebar */}
        <aside className="w-72 shrink-0 overflow-y-auto border-l border-gray-200 bg-white px-5 py-6 space-y-6">
          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Excerpt
            </label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none outline-none focus:border-indigo-400"
            />
          </div>

          {/* Feature image */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Feature image URL
            </label>
            <input
              type="url"
              value={featureImage}
              onChange={(e) => setFeatureImage(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            {featureImage && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={featureImage}
                alt="Feature"
                className="mt-2 w-full rounded-lg object-cover aspect-video"
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() =>
                    setSelectedTagIds((ids) =>
                      ids.includes(tag.id)
                        ? ids.filter((id) => id !== tag.id)
                        : [...ids, tag.id]
                    )
                  }
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium transition",
                    selectedTagIds.includes(tag.id)
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
