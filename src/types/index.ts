import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { posts } from "@/db/schemas/posts.sql";
import { Editor } from "@tiptap/react";
import { IconType } from "react-icons";
import {
  medias,
  newsletterSubscribers,
  permissions,
  roles,
  users,
} from "../db/schemas";
import { useFormik } from "formik";
import { ElementType } from "react";
import { getPost, getPostForEditing } from "../lib/queries/post";
import { getPosts } from "../lib/queries/posts";
import { getFeaturedPost } from "../lib/queries/featured";
import { getAuthorByUsername, getAuthorPosts } from "../lib/queries/author";

export type AggregatedPostViews = {
  viewed_date: Date | string;
  total_views: number;
  unique_views: number;
  registered_user_views: number;
  anonymous_views: number;
};
export type TaxonomyItemsWithMeta = {
  data: TaxonomyItem[];
  meta?: {
    totalPages: number;
    limit: number;
    page: number;
    total: number;
  };
};
export interface TaxonomyItem {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}
export type UserSelect = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;
export type RolesSelect = InferSelectModel<typeof roles>;
export type NewsletterInsert = InferInsertModel<typeof newsletterSubscribers>;
export type NewsletterSelect = InferSelectModel<typeof newsletterSubscribers>;
export type PostToPost = PostInsert & {
  categories: string[];
  tags: string[];
};
export interface UrlUploadProps {
  url: string;
  folder?: string;
  filename?: string;
}
export type MediaInsert = InferInsertModel<typeof medias>;
export type MediaType = MediaInsert["type"];
export type MediaResponse = InferSelectModel<typeof medias>;
export type PostInsert = InferInsertModel<typeof posts>;
type Permissions = InferInsertModel<typeof permissions>;
export type TPermissions = Permissions["name"];
export type PostSelect =
  | Awaited<ReturnType<typeof getPost>>
  | Awaited<ReturnType<typeof getPosts>>["data"][0];
export type FeaturedPostType = Awaited<ReturnType<typeof getFeaturedPost>>;
export type PostSelectForEditing = Awaited<
  ReturnType<typeof getPostForEditing>
>;
export type AuthorSelect = Awaited<ReturnType<typeof getAuthorByUsername>>;
export type AuthorPostsSelect = Awaited<ReturnType<typeof getAuthorPosts>>;
export interface EditorActionItem {
  id: string | number;
  label: string;
  command: ({ editor, open }: { editor?: Editor; open?: () => void }) => void;
  icon: IconType;
  active: (editor: Editor) => boolean;
}
export interface FilterParams {
  type?: MediaType;
  folder?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "created_at" | "name" | "size";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export type EDITOR_CONTEXT_STATE = {
  hasError: boolean;
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  isSaving: boolean;
  isDirty: boolean;
  updateField: <K extends keyof PostInsert>(
    key: K,
    value: PostInsert[K],
    shouldAutosave?: boolean,
    updateSlug?: boolean
  ) => void;
  activePost: PostSelect | null;
  setActivePost: (post: PostSelect | null) => void;
  initialContent: string;
  setInitialContent: (content: string) => void;
  setEditorContent: (content: EDITOR_CONTEXT_STATE["content"]) => void;
  savePost: () => void;
  updatePost?: (key: keyof PostInsert, value: any) => void;
  formik?: ReturnType<typeof useFormik<PostInsert>> | null;
  markdownContent?: string;
  content: {
    text?: string;
    html: string;
  };
  clearEditor: () => void;
  setIsSaving?: (isSaving: boolean) => void;
  isEditorReady: boolean;
  meta: {
    wordCount: number;
    characterCount: number;
  };
};
export interface NavItem extends NavItemWithoutPermission {}
export interface NavItemWithoutPermission {
  icon?: ElementType;
  label: string;
  href: string;
  iconName?: string;
  children?: Array<{
    label: string;
    href: string;
    icon?: ElementType;
    iconName?: string;
  }>;
}

export const DASH_NAV_PERMISSIONS = {
  VIEW_DASHBOARD: "analytics:view",
  VIEW_POSTS: "posts:view",
  CREATE_POST: "posts:create",
  VIEW_USERS: "users:read",
  VIEW_MEDIA: "media:read",
  VIEW_SETTINGS: "settings:read",
  VIEW_NEWSLETTERS: "newsletters:read",
  VIEW_ROLES: "roles:read",
  VIEW_COMMENTS: "comments:moderate",
} as const;

export type SettingEntry = {
  value: string;
  enabled: boolean;
  encrypted: boolean;
  canEncrypt?: boolean;
  folder: string;
  name: string;
  description?: string;
};

export type SiteSettings = {
  siteName: SettingEntry;
  siteDescription: SettingEntry;
  siteOpengraph: SettingEntry;
  siteFavicon: SettingEntry;
  siteLogo: SettingEntry;
  siteLogoMobile: SettingEntry;
  maintenanceMode: SettingEntry;
  gaId: SettingEntry;
  gtmId: SettingEntry;
  mixpanelToken: SettingEntry;
  posthogKey: SettingEntry;
  posthogHost: SettingEntry;
  sentryDsn: SettingEntry;
  sentryEnvironment: SettingEntry;
  errorTracking: SettingEntry;
  performanceMonitoring: SettingEntry;
  cloudinaryCloudName: SettingEntry;
  maxUploadSize: SettingEntry;
  defaultMediaFolder: SettingEntry;
  apiRateLimit: SettingEntry;
  cacheDuration: SettingEntry;
  newsletterEmailFrom: SettingEntry;
  emailFrom: SettingEntry;
  emailFromName: SettingEntry;
  localPostAnalytics: SettingEntry;
  showSiteNameWithLogo: SettingEntry;
  resendApiKey: SettingEntry;
  cloudinaryApiKey: SettingEntry;
  cloudinaryApiSecret: SettingEntry;
  [key: string]: SettingEntry;
};
export type ResendWebhookEvent = {
  type:
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.complained"
    | "email.bounced"
    | "email.opened"
    | "email.clicked";
  data: {
    email_id: string;
    created_at: string;
    to: string;
    from: string;
    subject: string;
  };
};
