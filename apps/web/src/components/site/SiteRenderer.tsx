import type { ComponentType } from "react";
import type { ThemePageProps, ThemeContext } from "@cms/core/types/theme";
import { getThemeManifest } from "@cms/themes/engine";

// Register built-in themes
import "@cms/themes/default";

interface SiteRendererProps {
  site: ThemePageProps["site"];
  context: ThemeContext;
  pagination?: ThemePageProps["pagination"];
  /** Active theme slug — defaults to "default" */
  themeName?: string;
}

// Map route type → manifest route key
const ROUTE_MAP = {
  index: "index",
  post: "post",
  page: "page",
  tag: "tag",
  author: "author",
  archive: "archive",
  error: "error",
} as const;

type RouteKey = (typeof ROUTE_MAP)[keyof typeof ROUTE_MAP];

// ---------------------------------------------------------------------------
// Theme page loaders — static import paths so webpack can resolve them.
// When adding a new theme, add a matching entry here.
// ---------------------------------------------------------------------------

const THEME_PAGE_LOADERS: Record<
  string,
  Record<RouteKey, () => Promise<{ default: ComponentType<ThemePageProps> }>>
> = {
  default: {
    index: () => import("@cms/themes/default/pages/Index"),
    post: () => import("@cms/themes/default/pages/Post"),
    page: () => import("@cms/themes/default/pages/Page"),
    tag: () => import("@cms/themes/default/pages/Tag"),
    author: () => import("@cms/themes/default/pages/Author"),
    archive: () => import("@cms/themes/default/pages/Archive"),
    error: () => import("@cms/themes/default/pages/Error"),
  },
};

export async function SiteRenderer({
  site,
  context,
  pagination,
  themeName = "default",
}: SiteRendererProps) {
  const manifest = getThemeManifest(themeName);

  if (!manifest) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Theme not found</h1>
        <p>
          Active theme: <code>{themeName}</code>
        </p>
      </div>
    );
  }

  const routeKey = ROUTE_MAP[context.type];

  // Resolve the theme page component via the static loader map
  const themeLoaders = THEME_PAGE_LOADERS[themeName];
  if (!themeLoaders) {
    return (
      <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <h1>Theme loader not registered</h1>
        <p>
          No page loaders found for theme: <code>{themeName}</code>
        </p>
      </div>
    );
  }

  const loader = themeLoaders[routeKey];
  const mod = await loader();
  const ThemePage = mod.default;

  // Build the request context from headers (minimal for SSR)
  const request: ThemePageProps["request"] = {
    url: "/",
    pathname: "/",
    searchParams: {},
  };

  const props: ThemePageProps = {
    site,
    context,
    ...(pagination !== undefined ? { pagination } : {}),
    request,
  };

  return (
    <>
      {/* Theme stylesheet */}
      {manifest.stylesheet && (
        // eslint-disable-next-line @next/next/no-css-tags
        <link rel="stylesheet" href={manifest.stylesheet} />
      )}
      <ThemePage {...props} />
    </>
  );
}
