/**
 * CalloutBlock — info/warning/tip/danger highlighted box.
 *
 * Per AGENTS.md: exports extension, attribute type, renderer function.
 */

import { Node, mergeAttributes } from "@tiptap/core";

export interface CalloutBlockAttrs {
  type: "info" | "warning" | "tip" | "danger";
  emoji: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    calloutBlock: {
      setCalloutBlock: (attrs?: Partial<CalloutBlockAttrs>) => ReturnType;
    };
  }
}

export const CalloutBlockExtension = Node.create<Record<string, never>>({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: { default: "info" },
      emoji: { default: "💡" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='callout']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as CalloutBlockAttrs;
    return [
      "div",
      mergeAttributes({
        "data-type": "callout",
        class: `callout callout-${attrs.type}`,
      }),
      ["span", { class: "callout-emoji", contenteditable: "false" }, attrs.emoji],
      ["div", { class: "callout-content" }, 0],
    ];
  },

  addCommands() {
    return {
      setCalloutBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { type: "info", emoji: "💡", ...attrs },
            content: [{ type: "paragraph" }],
          }),
    };
  },
});

export function renderCalloutBlock(attrs: CalloutBlockAttrs, innerHtml: string): string {
  return `<div data-type="callout" class="callout callout-${esc(attrs.type)}"><span class="callout-emoji">${escHtml(attrs.emoji)}</span><div class="callout-content">${innerHtml}</div></div>`;
}

function esc(v: string): string {
  return v.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
