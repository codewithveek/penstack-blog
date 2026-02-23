import dynamic from "next/dynamic";
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

  // Dynamically import the theme page component
  const ThemePage = dynamic<ThemePageProps>(
    () =>
      import(
        `../../../packages/themes/themes/${themeName}/pages/${routeKey.charAt(0).toUpperCase() + routeKey.slice(1)}.tsx`
      ).then((m: Record<string, unknown>) => {
        const Component = m["default"] ?? m[Object.keys(m)[0] ?? ""];
        return { default: Component } as {
          default: React.ComponentType<ThemePageProps>;
        };
      }),
    { ssr: true }
  );

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
