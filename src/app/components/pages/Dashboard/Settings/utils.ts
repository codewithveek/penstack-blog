import { SiteSettings } from "@/types";

export const groupSettingsByFolder = (settings: SiteSettings) => {
  return Object.entries(settings).reduce(
    (acc, [key, setting]) => {
      const folder = setting.folder || "misc";
      if (!acc[folder]) {
        acc[folder] = [];
      }
      acc[folder].push({
        key,
        ...setting,
      });
      return acc;
    },
    {} as Record<string, Array<any>>
  );
};
