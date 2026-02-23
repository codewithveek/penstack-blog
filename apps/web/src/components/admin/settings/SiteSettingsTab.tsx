"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { settingsApi, ApiRequestError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface SiteSettings {
  title: string;
  description: string;
  url: string;
  logo: string;
  coverImage: string;
  timezone: string;
  lang: string;
}

export function SiteSettingsTab() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "site"],
    queryFn: () => settingsApi.getSite(),
  });

  const raw = settings as Partial<SiteSettings> | undefined;

  const [form, setForm] = useState<SiteSettings>({
    title: "",
    description: "",
    url: "",
    logo: "",
    coverImage: "",
    timezone: "UTC",
    lang: "en",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (raw)
      setForm({
        title: raw.title ?? "",
        description: raw.description ?? "",
        url: raw.url ?? "",
        logo: raw.logo ?? "",
        coverImage: raw.coverImage ?? "",
        timezone: raw.timezone ?? "UTC",
        lang: raw.lang ?? "en",
      });
  }, [raw]);

  const mutation = useMutation({
    mutationFn: (data: SiteSettings) => settingsApi.updateSite(data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      if (err instanceof ApiRequestError) setError(err.message);
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    mutation.mutate(form);
  }

  if (isLoading)
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white rounded-xl border border-gray-200 p-6"
    >
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          Settings saved!
        </p>
      )}

      {(
        [
          "title",
          "description",
          "url",
          "logo",
          "coverImage",
          "timezone",
          "lang",
        ] as const
      ).map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
            {field.replace(/([A-Z])/g, " $1")}
          </label>
          <input
            value={form[field]}
            onChange={(e) =>
              setForm((f) => ({ ...f, [field]: e.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={mutation.isPending}
        className={cn(
          "rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition",
          mutation.isPending
            ? "opacity-60 cursor-not-allowed"
            : "hover:bg-indigo-700"
        )}
      >
        {mutation.isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
