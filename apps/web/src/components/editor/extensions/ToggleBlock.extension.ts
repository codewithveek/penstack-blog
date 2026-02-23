/**
 * ToggleBlock — collapsible accordion section.
 *
 * Per AGENTS.md: exports extension, attribute type, renderer function.
 */

import { Node, mergeAttributes } from "@tiptap/core";

export interface ToggleBlockAttrs {
  title: string;
  open: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    toggleBlock: {
      setToggleBlock: (attrs?: Partial<ToggleBlockAttrs>) => ReturnType;
    };
  }
}

export const ToggleBlockExtension = Node.create<Record<string, never>>({
  name: "toggleHeading",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      title: { default: "Toggle" },
      open: { default: false },
    };
  },

  parseHTML() {
    return [{ tag: "details[data-type='toggle-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as ToggleBlockAttrs;
    return [
      "details",
      mergeAttributes({
        "data-type": "toggle-block",
        ...(attrs.open ? { open: "true" } : {}),
      }),
      [
        "summary",
        { class: "toggle-title" },
        attrs.title,
      ],
      ["div", { class: "toggle-content" }, 0],
    ];
  },

  addCommands() {
    return {
      setToggleBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { title: "Toggle", open: false, ...attrs },
            content: [{ type: "paragraph" }],
          }),
    };
  },
});

export function renderToggleBlock(attrs: ToggleBlockAttrs, innerHtml: string): string {
  const openAttr = attrs.open ? " open" : "";
  return `<details data-type="toggle-block"${openAttr}><summary class="toggle-title">${escHtml(attrs.title)}</summary><div class="toggle-content">${innerHtml}</div></details>`;
}

function escHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
