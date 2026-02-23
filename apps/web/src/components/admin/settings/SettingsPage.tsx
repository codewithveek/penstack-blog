"use client";

import { useState } from "react";
import { SiteSettingsTab } from "./SiteSettingsTab";
import { EmailSettingsTab } from "./EmailSettingsTab";
import { AuthSettingsTab } from "./AuthSettingsTab";
import { MemberSettingsTab } from "./MemberSettingsTab";
import { DesignSettingsTab } from "./DesignSettingsTab";
import { IntegrationsSettingsTab } from "./IntegrationsSettingsTab";
import { cn } from "@/lib/utils";

const TABS = [
  "Site",
  "Design",
  "Members",
  "Email",
  "Authentication",
  "Integrations",
] as const;
type Tab = (typeof TABS)[number];

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("Site");

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap",
              tab === t
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Site" && <SiteSettingsTab />}
      {tab === "Design" && <DesignSettingsTab />}
      {tab === "Members" && <MemberSettingsTab />}
      {tab === "Email" && <EmailSettingsTab />}
      {tab === "Authentication" && <AuthSettingsTab />}
      {tab === "Integrations" && <IntegrationsSettingsTab />}
    </div>
  );
}
