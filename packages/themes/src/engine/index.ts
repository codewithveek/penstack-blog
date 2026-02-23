/**
 * packages/themes/src/engine/index.ts
 *
 * Public barrel export for the theme engine.
 */

export { registerTheme, getThemeManifest, listThemes } from "./loader";

export type {
  ThemeManifest,
  ThemeRoute,
  ThemeRouteKey,
  ThemeComponent,
} from "./loader";

export { estimateReadingTime } from "./reading-time";
