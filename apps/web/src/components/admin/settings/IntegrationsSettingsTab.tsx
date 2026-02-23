"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { integrationsSettingsApi } from "@/lib/api-client";

interface IntegrationSettings {
  stripeConnected: boolean;
  stripePublishableKey: string;
  searchProvider: string;
  storageProvider: string;
  analyticsEnabled: boolean;
  analyticsTrackingId: string;
  zapierWebhookUrl: string;
  slackWebhookUrl: string;
}

const defaultSettings: IntegrationSettings = {
  stripeConnected: false,
  stripePublishableKey: "",
  searchProvider: "tidb_fts",
  storageProvider: "r2",
  analyticsEnabled: false,
  analyticsTrackingId: "",
  zapierWebhookUrl: "",
  slackWebhookUrl: "",
};

export function IntegrationsSettingsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "integrations"],
    queryFn: () => integrationsSettingsApi.get(),
  });

  const settings = (data ?? defaultSettings) as IntegrationSettings;
  const [form, setForm] = useState<IntegrationSettings>(settings);

  const saveMutation = useMutation({
    mutationFn: (payload: IntegrationSettings) =>
      integrationsSettingsApi.update(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["settings", "integrations"] }),
  });

  if (!isLoading && data && form === defaultSettings) {
    setForm(data as IntegrationSettings);
  }

  function handleChange<K extends keyof IntegrationSettings>(
    field: K,
    value: IntegrationSettings[K]
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
        Connect external services and configure third-party integrations.
      </p>

      {/* Payments */}
      <section className="space-y-4">
        <h2 className="font-semibold text-gray-800">Payments</h2>
        <div className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Stripe</p>
              <p className="text-xs text-gray-500">
                {form.stripeConnected ? "Connected" : "Not connected"}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${form.stripeConnected ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
            >
              {form.stripeConnected ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Publishable key
            </label>
            <input
              type="text"
              value={form.stripePublishableKey}
              onChange={(e) =>
                handleChange("stripePublishableKey", e.target.value)
              }
              placeholder="pk_live_xxx"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              Secret key and webhook secret are set via environment variables.
            </p>
          </div>
        </div>
      </section>

      {/* Providers */}
      <section className="space-y-4">
        <h2 className="font-semibold text-gray-800">Providers</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Search provider
            </label>
            <select
              value={form.searchProvider}
              onChange={(e) => handleChange("searchProvider", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="tidb_fts">TiDB Full-Text Search</option>
              <option value="meilisearch">Meilisearch</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Storage provider
            </label>
            <select
              value={form.storageProvider}
              onChange={(e) => handleChange("storageProvider", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="r2">Cloudflare R2</option>
              <option value="s3">AWS S3</option>
              <option value="cloudinary">Cloudinary</option>
            </select>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section className="space-y-4">
        <h2 className="font-semibold text-gray-800">Analytics</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.analyticsEnabled}
            onChange={() =>
              handleChange("analyticsEnabled", !form.analyticsEnabled)
            }
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-800">
            Enable third-party analytics
          </span>
        </label>
        {form.analyticsEnabled && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Tracking ID
            </label>
            <input
              type="text"
              value={form.analyticsTrackingId}
              onChange={(e) =>
                handleChange("analyticsTrackingId", e.target.value)
              }
              placeholder="G-XXXXXXXXXX"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}
      </section>

      {/* Webhooks */}
      <section className="space-y-4">
        <h2 className="font-semibold text-gray-800">Webhook Integrations</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Zapier webhook URL
          </label>
          <input
            type="url"
            value={form.zapierWebhookUrl}
            onChange={(e) => handleChange("zapierWebhookUrl", e.target.value)}
            placeholder="https://hooks.zapier.com/..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Slack incoming webhook URL
          </label>
          <input
            type="url"
            value={form.slackWebhookUrl}
            onChange={(e) => handleChange("slackWebhookUrl", e.target.value)}
            placeholder="https://hooks.slack.com/..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
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
