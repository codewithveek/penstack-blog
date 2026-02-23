"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memberSettingsApi } from "@/lib/api-client";

interface MemberSettings {
  allowFreeSignup: boolean;
  requireEmailConfirmation: boolean;
  defaultNewsletterOptIn: boolean;
  memberWelcomePageUrl: string;
  sendWelcomeEmail: boolean;
  paidMembersEnabled: boolean;
  stripePriceIdMonthly: string;
  stripePriceIdYearly: string;
}

const defaultSettings: MemberSettings = {
  allowFreeSignup: true,
  requireEmailConfirmation: true,
  defaultNewsletterOptIn: true,
  memberWelcomePageUrl: "",
  sendWelcomeEmail: true,
  paidMembersEnabled: false,
  stripePriceIdMonthly: "",
  stripePriceIdYearly: "",
};

export function MemberSettingsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "members"],
    queryFn: () => memberSettingsApi.get(),
  });

  const settings = (data ?? defaultSettings) as MemberSettings;
  const [form, setForm] = useState<MemberSettings>(settings);

  const saveMutation = useMutation({
    mutationFn: (payload: MemberSettings) => memberSettingsApi.update(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["settings", "members"] }),
  });

  if (!isLoading && data && form === defaultSettings) {
    setForm(data as MemberSettings);
  }

  function handleToggle(field: keyof MemberSettings) {
    setForm((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }

  function handleChange(field: keyof MemberSettings, value: string) {
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
        Control how members can sign up and what they receive.
      </p>

      <section className="space-y-4">
        <h2 className="font-semibold text-gray-800">Signup</h2>
        <Toggle
          label="Allow free signup"
          description="Let visitors sign up as free members"
          checked={form.allowFreeSignup}
          onChange={() => handleToggle("allowFreeSignup")}
        />
        <Toggle
          label="Require email confirmation"
          description="Members must confirm their email before access"
          checked={form.requireEmailConfirmation}
          onChange={() => handleToggle("requireEmailConfirmation")}
        />
        <Toggle
          label="Send welcome email"
          description="Send a welcome email when a new member joins"
          checked={form.sendWelcomeEmail}
          onChange={() => handleToggle("sendWelcomeEmail")}
        />
        <Toggle
          label="Subscribe to newsletter by default"
          description="Auto-subscribe new members to your default newsletter"
          checked={form.defaultNewsletterOptIn}
          onChange={() => handleToggle("defaultNewsletterOptIn")}
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Welcome page URL
          </label>
          <input
            type="url"
            value={form.memberWelcomePageUrl}
            onChange={(e) =>
              handleChange("memberWelcomePageUrl", e.target.value)
            }
            placeholder="https://yoursite.com/welcome"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold text-gray-800">Paid Memberships</h2>
        <Toggle
          label="Enable paid memberships"
          description="Allow members to purchase paid plans via Stripe"
          checked={form.paidMembersEnabled}
          onChange={() => handleToggle("paidMembersEnabled")}
        />
        {form.paidMembersEnabled && (
          <div className="space-y-3 pl-7">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Monthly Stripe Price ID
              </label>
              <input
                type="text"
                value={form.stripePriceIdMonthly}
                onChange={(e) =>
                  handleChange("stripePriceIdMonthly", e.target.value)
                }
                placeholder="price_xxx"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Yearly Stripe Price ID
              </label>
              <input
                type="text"
                value={form.stripePriceIdYearly}
                onChange={(e) =>
                  handleChange("stripePriceIdYearly", e.target.value)
                }
                placeholder="price_xxx"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}
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

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </label>
  );
}
