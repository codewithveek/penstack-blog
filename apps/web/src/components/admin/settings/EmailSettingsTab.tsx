"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { settingsApi, ApiRequestError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface EmailSettings {
  provider: string;
  fromEmail: string;
  fromName: string;
}

export function EmailSettingsTab() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "email"],
    queryFn: () => settingsApi.getEmail(),
  });

  const raw = settings as Partial<EmailSettings> | undefined;

  const [form, setForm] = useState<EmailSettings>({
    provider: "resend",
    fromEmail: "",
    fromName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (raw)
      setForm({
        provider: raw.provider ?? "resend",
        fromEmail: raw.fromEmail ?? "",
        fromName: raw.fromName ?? "",
      });
  }, [raw]);

  const mutation = useMutation({
    mutationFn: (data: EmailSettings) => settingsApi.updateEmail(data),
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
          Email settings saved!
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Provider
        </label>
        <select
          value={form.provider}
          onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="resend">Resend</option>
          <option value="smtp">SMTP</option>
          <option value="mailgun">Mailgun</option>
          <option value="postmark">Postmark</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          From email
        </label>
        <input
          type="email"
          value={form.fromEmail}
          onChange={(e) =>
            setForm((f) => ({ ...f, fromEmail: e.target.value }))
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          From name
        </label>
        <input
          value={form.fromName}
          onChange={(e) => setForm((f) => ({ ...f, fromName: e.target.value }))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
      </div>

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
