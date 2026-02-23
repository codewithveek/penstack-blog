"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { designSettingsApi } from "@/lib/api-client";

interface DesignSettings {
  accentColor: string;
  logo: string;
  icon: string;
  coverImage: string;
  theme: string;
  postsPerPage: number;
  showAuthorProfiles: boolean;
  showRelatedPosts: boolean;
  showShareButtons: boolean;
  showComments: boolean;
}

const defaultSettings: DesignSettings = {
  accentColor: "#4f46e5",
  logo: "",
  icon: "",
  coverImage: "",
  theme: "default",
  postsPerPage: 15,
  showAuthorProfiles: true,
  showRelatedPosts: true,
  showShareButtons: true,
  showComments: false,
};

export function DesignSettingsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "design"],
    queryFn: () => designSettingsApi.get(),
  });

  const settings = (data ?? defaultSettings) as DesignSettings;
  const [form, setForm] = useState<DesignSettings>(settings);

  const saveMutation = useMutation({
    mutationFn: (payload: DesignSettings) => designSettingsApi.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "design"] }),
  });

  if (!isLoading && data && form === defaultSettings) {
    setForm(data as DesignSettings);
  }

  function handleChange<K extends keyof DesignSettings>(
    field: K,
    value: DesignSettings[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    saveMutation.mutate(form);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Customize the look and feel of your public site.
      </p>

      {/* Branding */}
      <section className="space-y-4">
        <h2 className="font-semibold text-gray-800">Branding</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Accent color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => handleChange("accentColor", e.target.value)}
                className="h-8 w-12 rounded border border-gray-300 p-0 cursor-pointer"
              />
              <input
                type="text"
                value={form.accentColor}
                onChange={(e) => handleChange("accentColor", e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Theme
            </label>
            <select
              value={form.theme}
              onChange={(e) => handleChange("theme", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="default">Default</option>
            </select>
          </div>
        </div>

        <InputField
          label="Logo URL"
          value={form.logo}
          placeholder="https://...logo.png"
          onChange={(v) => handleChange("logo", v)}
        />
        <InputField
          label="Site icon URL"
          value={form.icon}
          placeholder="https://...icon.png"
          onChange={(v) => handleChange("icon", v)}
        />
        <InputField
          label="Cover image URL"
          value={form.coverImage}
          placeholder="https://...cover.jpg"
          onChange={(v) => handleChange("coverImage", v)}
        />
      </section>

      {/* Layout */}
      <section className="space-y-4">
        <h2 className="font-semibold text-gray-800">Layout</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Posts per page
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.postsPerPage}
            onChange={(e) =>
              handleChange("postsPerPage", Number(e.target.value))
            }
            className="w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <Toggle
          label="Show author profiles"
          checked={form.showAuthorProfiles}
          onChange={() =>
            handleChange("showAuthorProfiles", !form.showAuthorProfiles)
          }
        />
        <Toggle
          label="Show related posts"
          checked={form.showRelatedPosts}
          onChange={() =>
            handleChange("showRelatedPosts", !form.showRelatedPosts)
          }
        />
        <Toggle
          label="Show share buttons"
          checked={form.showShareButtons}
          onChange={() =>
            handleChange("showShareButtons", !form.showShareButtons)
          }
        />
        <Toggle
          label="Show comments"
          checked={form.showComments}
          onChange={() => handleChange("showComments", !form.showComments)}
        />
      </section>

      <button
        onClick={handleSave}
        disabled={saveMutation.isPending}
        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {saveMutation.isPending ? "Saving…" : "Save changes"}
      </button>

      {saveMutation.isSuccess && (
        <p className="text-sm text-green-600 mt-2">Settings saved.</p>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
}
