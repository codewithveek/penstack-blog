/**
 * RelatedPostBlock — "Read also" in-content card.
 *
 * References a post by slug. The frontend/theme renders the actual post card
 * with data fetched at build/request time.
 */

import { Node, mergeAttributes } from "@tiptap/core";

export interface RelatedPostBlockAttrs {
  postSlug: string;
  postTitle: string;
  postExcerpt: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    relatedPostBlock: {
      setRelatedPostBlock: (
        attrs?: Partial<RelatedPostBlockAttrs>
      ) => ReturnType;
    };
  }
}

export const RelatedPostBlockExtension = Node.create<Record<string, never>>({
  name: "relatedPostBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      postSlug: { default: "" },
      postTitle: { default: "" },
      postExcerpt: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='related-post']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as RelatedPostBlockAttrs;
    return [
      "div",
      mergeAttributes({
        "data-type": "related-post",
        "data-post-slug": attrs.postSlug,
        class: "related-post-block",
      }),
      [
        "a",
        { href: `/${attrs.postSlug}`, class: "related-post-link" },
        ["span", { class: "related-post-label" }, "Read also"],
        ["strong", { class: "related-post-title" }, attrs.postTitle],
        ["span", { class: "related-post-excerpt" }, attrs.postExcerpt],
      ],
    ];
  },

  addCommands() {
    return {
      setRelatedPostBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

export function renderRelatedPostBlock(attrs: RelatedPostBlockAttrs): string {
  return `<div data-type="related-post" data-post-slug="${esc(attrs.postSlug)}" class="related-post-block">
  <a href="/${esc(attrs.postSlug)}" class="related-post-link">
    <span class="related-post-label">Read also</span>
    <strong class="related-post-title">${escHtml(attrs.postTitle)}</strong>
    <span class="related-post-excerpt">${escHtml(attrs.postExcerpt)}</span>
  </a>
</div>`;
}

function esc(v: string): string {
  return v.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
