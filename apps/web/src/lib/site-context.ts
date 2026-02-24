/**
 * apps/web/src/lib/site-context.ts
 *
 * Server-side helper that fetches public site settings from the Content API
 * and transforms them into the ThemeSiteContext shape expected by theme components.
 */

import type { ThemeSiteContext } from "@cms/core/types/theme";
import { api } from "./api-client";

/**
 * Fetch the public site settings and map them to ThemeSiteContext.
 * Used by all (site) route pages to build the `site` prop for SiteRenderer.
 */
export async function fetchSiteContext(): Promise<ThemeSiteContext> {
  const settings = await api.get<Record<string, string>>(
    "/api/content/v1/settings"
  );

  // Parse navigation JSON if stored, otherwise empty array
  let navigation: ThemeSiteContext["navigation"] = [];
  if (settings.navigation) {
    try {
      navigation = JSON.parse(settings.navigation) as ThemeSiteContext["navigation"];
    } catch {
      navigation = [];
    }
  }

  const socialLinks: ThemeSiteContext["socialLinks"] = {};
  if (settings.twitter) socialLinks.twitter = settings.twitter;
  if (settings.facebook) socialLinks.facebook = settings.facebook;

  const result: ThemeSiteContext = {
    title: settings.meta_title || settings.site_name || "Untitled Site",
    description: settings.meta_description || settings.site_description || "",
    url: settings.site_url || "/",
    navigation,
    socialLinks,
    paidMembershipsEnabled: settings.paid_memberships_enabled === "true",
    locale: settings.locale || "en",
  };

  if (settings.logo) result.logo = settings.logo;
  if (settings.icon) result.favicon = settings.icon;
  if (settings.cover_image) result.coverImage = settings.cover_image;
  if (settings.accent_color) result.accentColor = settings.accent_color;

  return result;
}
