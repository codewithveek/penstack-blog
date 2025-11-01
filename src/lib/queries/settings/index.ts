import "server-only";
import { db } from "@/db";
import { siteSettings } from "@/db/schemas";
import { SiteSettings } from "@/types";
import { DEFAULT_SETTINGS } from "./config";
import { isSecretKey } from "@/utils";
import { encryptKey } from "../../encryption";

import { unstable_cache } from "next/cache";

export const getSettings = unstable_cache(
  async () => {
    const settings = await db.select().from(siteSettings);

    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value || "",
        enabled: setting.enabled as boolean,
        encrypted: setting.encrypted as boolean,
        canEncrypt: setting.canEncrypt as boolean,
        folder: setting.folder || "misc",
        name: setting.name || "",
        description: setting.description || "",
      };
      return acc;
    }, {} as SiteSettings);

    return { ...DEFAULT_SETTINGS, ...settingsObj };
  },
  ["getSettings"],
  { tags: ["getSettings"], revalidate: 60 * 60 * 24 }
);

export async function updateSettings(newSettings: SiteSettings) {
  const operations = Object.entries(newSettings).map(([key, setting]) => {
    const value =
      isSecretKey(key) &&
      setting.value &&
      !setting.encrypted &&
      setting.canEncrypt
        ? encryptKey(setting.value)
        : setting.value;

    return db
      .insert(siteSettings)
      .values({
        key,
        value,
        enabled: setting.enabled,
        encrypted: setting.encrypted,
        canEncrypt: setting.canEncrypt,
        name: setting.name,
        description: setting.description,
        folder: setting.folder as
          | "email"
          | "general"
          | "analytics"
          | "monitoring"
          | "media"
          | "advanced"
          | "social"
          | "misc",
      })
      .onDuplicateKeyUpdate({
        set: {
          key,
          value,
          enabled: setting.enabled,
          encrypted: setting.encrypted,
          canEncrypt: setting.canEncrypt,
          name: setting.name,
          description: setting.description,
          folder: setting.folder as
            | "email"
            | "general"
            | "analytics"
            | "monitoring"
            | "media"
            | "advanced"
            | "social"
            | "misc",
          updated_at: new Date(),
        },
      });
  });

  for (const operation of operations) {
    await operation;
  }
}
