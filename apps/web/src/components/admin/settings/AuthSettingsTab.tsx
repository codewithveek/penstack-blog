"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authSettingsApi } from "@/lib/api-client";

interface AuthSettings {
  allowSignup: boolean;
  allowSocialForAdmins: boolean;
  magicLinkEnabled: boolean;
  googleEnabled: boolean;
  googleClientId: string;
  facebookEnabled: boolean;
  facebookAppId: string;
  githubEnabled: boolean;
  githubClientId: string;
}

const defaultSettings: AuthSettings = {
  allowSignup: true,
  allowSocialForAdmins: false,
  magicLinkEnabled: true,
  googleEnabled: false,
  googleClientId: "",
  facebookEnabled: false,
  facebookAppId: "",
  githubEnabled: false,
  githubClientId: "",
};

export function AuthSettingsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "auth"],
    queryFn: () => authSettingsApi.get(),
  });

  const settings = (data ?? defaultSettings) as AuthSettings;
  const [form, setForm] = useState<AuthSettings>(settings);

  const saveMutation = useMutation({
    mutationFn: (payload: AuthSettings) => authSettingsApi.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "auth"] }),
  });

  // Sync form when data loads
  if (!isLoading && data && form === defaultSettings) {
    setForm(data as AuthSettings);
  }

  function handleToggle(field: keyof AuthSettings) {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  function handleChange(field: keyof AuthSettings, value: string) {
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
        Configure authentication providers and signup policies for your site.
      </p>

      {/* Signup & magic link */}
      <section className="space-y-4">
        <h2 className="font-semibold text-gray-800">General</h2>
        <Toggle
          label="Allow member signup"
          description="Allow new members to register on your site"
          checked={form.allowSignup}
          onChange={() => handleToggle("allowSignup")}
        />
        <Toggle
          label="Magic link login"
          description="Always enabled — cannot be disabled"
          checked={form.magicLinkEnabled}
          onChange={() => undefined}
          disabled
        />
        <Toggle
          label="Allow social login for admins"
          description="Let admin users sign in via OAuth providers"
          checked={form.allowSocialForAdmins}
          onChange={() => handleToggle("allowSocialForAdmins")}
        />
      </section>

      {/* Social providers */}
      <section className="space-y-4">
        <h2 className="font-semibold text-gray-800">Social Providers</h2>

        <ProviderRow
          name="Google"
          enabled={form.googleEnabled}
          onToggle={() => handleToggle("googleEnabled")}
          clientIdLabel="Client ID"
          clientId={form.googleClientId}
          onClientIdChange={(v) => handleChange("googleClientId", v)}
        />
        <ProviderRow
          name="Facebook"
          enabled={form.facebookEnabled}
          onToggle={() => handleToggle("facebookEnabled")}
          clientIdLabel="App ID"
          clientId={form.facebookAppId}
          onClientIdChange={(v) => handleChange("facebookAppId", v)}
        />
        <ProviderRow
          name="GitHub"
          enabled={form.githubEnabled}
          onToggle={() => handleToggle("githubEnabled")}
          clientIdLabel="Client ID"
          clientId={form.githubClientId}
          onClientIdChange={(v) => handleChange("githubClientId", v)}
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

/* ── Helpers ─────────────────────────────────────────────── */

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-40"
      />
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  );
}

function ProviderRow({
  name,
  enabled,
  onToggle,
  clientIdLabel,
  clientId,
  onClientIdChange,
}: {
  name: string;
  enabled: boolean;
  onToggle: () => void;
  clientIdLabel: string;
  clientId: string;
  onClientIdChange: (v: string) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
      <Toggle
        label={name}
        description={`Enable ${name} sign-in`}
        checked={enabled}
        onChange={onToggle}
      />
      {enabled && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {clientIdLabel}
          </label>
          <input
            type="text"
            value={clientId}
            onChange={(e) => onClientIdChange(e.target.value)}
            placeholder={`Enter ${name} ${clientIdLabel}`}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Client secret is set via environment variables for security.
          </p>
        </div>
      )}
    </div>
  );
}
