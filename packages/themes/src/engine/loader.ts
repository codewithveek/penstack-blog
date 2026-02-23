/**
 * packages/themes/src/engine/loader.ts
 *
 * Theme loader — resolves a theme slug to its registered component map.
 * Themes are loaded via Next.js dynamic() to keep them out of the main bundle.
 * PRD §12.4
 */

import type { ThemePageProps } from "@cms/core/types/theme";
import type { ComponentType } from "react";

// ---------------------------------------------------------------------------
// Theme manifest types
// ---------------------------------------------------------------------------

export interface ThemeRoute {
  /** React component file path relative to the theme's root */
  component: string;
}

export interface ThemeManifest {
  /** Theme slug, e.g. "default" */
  slug: string;
  /** Display name */
  name: string;
  /** Theme author */
  author: string;
  /** Semver version */
  version: string;
  /** CSS file to inject (scoped via @layer theme) */
  stylesheet?: string;
  /** Route → component map (must match PRD §12.2 required routes) */
  routes: {
    index: ThemeRoute;
    post: ThemeRoute;
    page: ThemeRoute;
    tag: ThemeRoute;
    author: ThemeRoute;
    archive: ThemeRoute;
  };
}

// ---------------------------------------------------------------------------
// Required route keys
// ---------------------------------------------------------------------------

export type ThemeRouteKey = keyof ThemeManifest["routes"];

// ---------------------------------------------------------------------------
// Resolved theme component for a page type
// ---------------------------------------------------------------------------

export type ThemeComponent = ComponentType<ThemePageProps>;

// ---------------------------------------------------------------------------
// Theme registry (populated at app startup)
// ---------------------------------------------------------------------------

const registry = new Map<string, ThemeManifest>();

export function registerTheme(manifest: ThemeManifest): void {
  registry.set(manifest.slug, manifest);
}

export function getThemeManifest(slug: string): ThemeManifest | undefined {
  return registry.get(slug);
}

export function listThemes(): ThemeManifest[] {
  return [...registry.values()];
}
