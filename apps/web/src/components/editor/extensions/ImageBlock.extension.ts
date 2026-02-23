/**
 * ImageBlock — custom Tiptap block node extension.
 *
 * Per AGENTS.md rules:
 * - Lives in its own file as `{Name}.extension.ts`
 * - Exports: the Tiptap extension, attribute type, renderer function
 * - The renderer is consumed by packages/core/content/renderer.ts
 * - Slash command is registered so `/image` inserts the block
 */

import { Node, mergeAttributes } from "@tiptap/core";

// ---------------------------------------------------------------------------
// Attribute type (used by renderer + editor toolbar)
// ---------------------------------------------------------------------------

export interface ImageBlockAttrs {
  src: string;
  alt: string;
  caption: string;
  /** Original file width, used for responsive sizing */
  width: number | null;
  /** Original file height */
  height: number | null;
  /** Full-width or bounded */
  fullWidth: boolean;
  /** Optional link wrapping the image */
  href: string;
}

// ---------------------------------------------------------------------------
// Extension
// ---------------------------------------------------------------------------

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attrs: Partial<ImageBlockAttrs>) => ReturnType;
      updateImageBlock: (attrs: Partial<ImageBlockAttrs>) => ReturnType;
    };
  }
}

export const ImageBlockExtension = Node.create<Record<string, never>>({
  name: "imageBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
      width: { default: null },
      height: { default: null },
      fullWidth: { default: false },
      href: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-type='image-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption, width, height, fullWidth, href } = HTMLAttributes as ImageBlockAttrs;

    const imgAttrs: Record<string, unknown> = {
      src,
      alt: alt || "",
      ...(width ? { width } : {}),
      ...(height ? { height } : {}),
      loading: "lazy",
      decoding: "async",
    };

    const img = ["img", mergeAttributes(imgAttrs)];
    const inner = href ? ["a", { href, rel: "noopener noreferrer" }, img] : img;
    const figcaption = caption
      ? ["figcaption", {}, caption]
      : null;

    return [
      "figure",
      mergeAttributes({ "data-type": "image-block", class: fullWidth ? "full-width" : "" }),
      inner,
      ...(figcaption ? [figcaption] : []),
    ];
  },

  addCommands() {
    return {
      setImageBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),

      updateImageBlock:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
    };
  },
});

// ---------------------------------------------------------------------------
// Server-side HTML renderer
// Used in packages/core/content/renderer.ts when it encounters this node type.
// ---------------------------------------------------------------------------

export function renderImageBlock(attrs: ImageBlockAttrs): string {
  const { src, alt, caption, width, height, fullWidth, href } = attrs;

  const imgTag = `<img
    src="${escapeAttr(src)}"
    alt="${escapeAttr(alt)}"
    ${width ? `width="${width}"` : ""}
    ${height ? `height="${height}"` : ""}
    loading="lazy"
    decoding="async"
  />`;

  const inner = href
    ? `<a href="${escapeAttr(href)}" rel="noopener noreferrer">${imgTag}</a>`
    : imgTag;

  const figcaptionTag = caption
    ? `<figcaption>${escapeHtml(caption)}</figcaption>`
    : "";

  return `<figure data-type="image-block"${fullWidth ? ' class="full-width"' : ""}>${inner}${figcaptionTag}</figure>`;
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
