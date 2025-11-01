import { PenstackHeadingsRenderer } from "@/components//Renderers/HeadingsRenderer";
import { generateSlug } from "@/utils";
import Heading from "@tiptap/extension-heading";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";

export const PenstackHeadingExtension = Heading.extend({
  priority: 2,

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      new Plugin({
        key: new PluginKey("heading-ids"),
        appendTransaction: (transactions, oldState, newState) => {
          const docChanged = transactions.some((tr) => tr.docChanged);
          if (!docChanged) return;

          const tr = newState.tr;
          let modified = false;

          newState.doc.descendants((node, pos) => {
            if (node.type.name === "heading") {
              const newId = generateSlug(node.textContent);
              if (newId && node.attrs.id !== newId) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  id: newId,
                });
                modified = true;
              }
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PenstackHeadingsRenderer);
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("id"),
        renderHTML: (attributes) => ({
          id: attributes.id,
        }),
      },
      level: {
        default: 1,
        parseHTML: (element) =>
          Number(element.tagName.toLowerCase().replace("h", "")),
        renderHTML: (attributes) => ({
          level: attributes.level,
        }),
      },
    };
  },
});
