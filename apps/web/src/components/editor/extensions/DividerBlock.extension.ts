/**
 * DividerBlock — styled horizontal divider with variants.
 *
 * Per AGENTS.md: exports extension, attribute type, renderer function.
 */

import { Node, mergeAttributes } from "@tiptap/core";

export interface DividerBlockAttrs {
  style: "solid" | "dashed" | "dotted" | "double" | "gradient";
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    dividerBlock: {
      setDividerBlock: (attrs?: Partial<DividerBlockAttrs>) => ReturnType;
    };
  }
}

export const DividerBlockExtension = Node.create<Record<string, never>>({
  name: "dividerBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      style: { default: "solid" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='divider-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as DividerBlockAttrs;
    return [
      "div",
      mergeAttributes({
        "data-type": "divider-block",
        class: `divider divider-${attrs.style}`,
      }),
      ["hr", {}],
    ];
  },

  addCommands() {
    return {
      setDividerBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { style: "solid", ...attrs },
          }),
    };
  },
});

export function renderDividerBlock(attrs: DividerBlockAttrs): string {
  return `<div data-type="divider-block" class="divider divider-${esc(attrs.style)}"><hr /></div>`;
}

function esc(v: string): string {
  return v.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
