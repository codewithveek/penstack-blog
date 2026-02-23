/**
 * packages/themes/themes/default/index.ts
 *
 * Default theme barrel — registers the theme on import.
 */

import { registerTheme } from "../../src/engine/loader";
import themeJson from "./theme.json";

const manifest = themeJson as Parameters<typeof registerTheme>[0];
registerTheme(manifest);

export { default as IndexPage } from "./pages/Index";
export { default as PostPage } from "./pages/Post";
export { default as PagePage } from "./pages/Page";
export { default as TagPage } from "./pages/Tag";
export { default as AuthorPage } from "./pages/Author";
export { default as ArchivePage } from "./pages/Archive";
