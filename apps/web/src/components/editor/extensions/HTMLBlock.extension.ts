/**
 * HTMLBlock — raw HTML passthrough block (sanitized server-side).
 *
 * Per AGENTS.md: exports extension, attribute type, renderer function.
 * Content is sanitized via isomorphic-dompurify before storage.
 */

import { Node, mergeAttributes } from "@tiptap/core";

export interface HTMLBlockAttrs {
  content: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    htmlBlock: {
      setHtmlBlock: (attrs?: Partial<HTMLBlockAttrs>) => ReturnType;
    };
  }
}

export const HTMLBlockExtension = Node.create<Record<string, never>>({
  name: "htmlBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      content: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='html-block']" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "html-block" }),
      ["pre", { class: "html-block-preview" }, (HTMLAttributes as HTMLBlockAttrs).content],
    ];
  },

  addCommands() {
    return {
      setHtmlBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { content: "", ...attrs },
          }),
    };
  },
});

export function renderHtmlBlock(attrs: HTMLBlockAttrs): string {
  // Server-side: content should already be sanitized with DOMPurify before
  // storage. Renderer outputs it wrapped in a container.
  return `<div data-type="html-block">${attrs.content}</div>`;
}
