/**
 * packages/core/src/types/theme.ts
 *
 * Theme context contract.
 * Theme authors receive ONLY these objects — no DB access, no API calls.
 * PRD §12.3
 */

// ---------------------------------------------------------------------------
// Site context (passed to all theme page components)
// ---------------------------------------------------------------------------

export interface ThemeSiteContext {
  title: string;
  description: string;
  url: string;
  logo?: string;
  favicon?: string;
  coverImage?: string;
  navigation: Array<{ label: string; url: string }>;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
  };
  paidMembershipsEnabled: boolean;
  accentColor?: string;
  locale: string;
}

// ---------------------------------------------------------------------------
// Author context
// ---------------------------------------------------------------------------

export interface ThemeAuthorContext {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  website?: string;
  twitter?: string;
  facebook?: string;
  location?: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Tag context
// ---------------------------------------------------------------------------

export interface ThemeTagContext {
  id: string;
  name: string;
  slug: string;
  description?: string;
  featureImage?: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Post context
// ---------------------------------------------------------------------------

export interface ThemePostContext {
  id: string;
  title: string;
  slug: string;
  url: string;
  excerpt?: string;
  html: string;
  featureImage?: string;
  featureImageAlt?: string;
  publishedAt?: string;
  updatedAt: string;
  readingTimeMinutes: number;
  visibility: "public" | "members" | "paid";
  type: "post" | "page";
  authors: ThemeAuthorContext[];
  primaryAuthor: ThemeAuthorContext;
  tags: ThemeTagContext[];
  primaryTag?: ThemeTagContext;
  /** SEO fields */
  og: {
    title?: string;
    description?: string;
    image?: string;
  };
  twitter: {
    title?: string;
    description?: string;
    image?: string;
  };
  canonical?: string;
  /** Custom code injected in post head / foot */
  codeInjection?: {
    head?: string;
    foot?: string;
  };
}

// ---------------------------------------------------------------------------
// Request context
// ---------------------------------------------------------------------------

export interface ThemeRequestContext {
  url: string;
  pathname: string;
  searchParams: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Pagination context
// ---------------------------------------------------------------------------

export interface ThemePaginationContext {
  page: number;
  pages: number;
  total: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextUrl?: string;
  prevUrl?: string;
}

// ---------------------------------------------------------------------------
// Page props (passed to all theme page React components)
// ---------------------------------------------------------------------------

export type ThemeContext =
  | { type: "index"; posts: ThemePostContext[] }
  | { type: "post"; post: ThemePostContext }
  | { type: "page"; post: ThemePostContext }
  | { type: "tag"; tag: ThemeTagContext; posts: ThemePostContext[] }
  | { type: "author"; author: ThemeAuthorContext; posts: ThemePostContext[] }
  | { type: "archive"; posts: ThemePostContext[] }
  | { type: "error"; statusCode: number; message: string };

export interface ThemePageProps<T extends ThemeContext = ThemeContext> {
  site: ThemeSiteContext;
  context: T;
  pagination?: ThemePaginationContext;
  request: ThemeRequestContext;
}
