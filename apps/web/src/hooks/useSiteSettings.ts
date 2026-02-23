"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api-client";

export interface SiteSettings {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  icon?: string;
  url?: string;
  accentColor: string;
  timezone: string;
  locale: string;
  metaTitle?: string;
  metaDescription?: string;
  twitterHandle?: string;
  facebookUrl?: string;
  activeTheme: string;
  membershipEnabled: boolean;
  defaultContentVisibility: string;
}

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["settings", "site"],
    queryFn: () => settingsApi.getSite() as Promise<SiteSettings>,
  });
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SiteSettings>) => settingsApi.updateSite(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "site"] }),
  });
}

export interface EmailSettings {
  provider: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
}

export function useEmailSettings() {
  return useQuery<EmailSettings>({
    queryKey: ["settings", "email"],
    queryFn: () => settingsApi.getEmail() as Promise<EmailSettings>,
  });
}

export function useUpdateEmailSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmailSettings>) => settingsApi.updateEmail(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "email"] }),
  });
}

export interface AuthSettings {
  allowSocialForAdmins: boolean;
  googleClientId?: string;
  googleEnabled: boolean;
  githubEnabled: boolean;
  facebookEnabled: boolean;
}

export function useAuthSettings() {
  return useQuery<AuthSettings>({
    queryKey: ["settings", "auth"],
    queryFn: () => settingsApi.getAuth() as Promise<AuthSettings>,
  });
}

export function useUpdateAuthSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AuthSettings>) => settingsApi.updateAuth(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "auth"] }),
  });
}
