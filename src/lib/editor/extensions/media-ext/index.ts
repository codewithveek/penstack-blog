import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MediaAspectRatios, MediaObjectFits } from "@/lib/editor/types";
import { MediaComponentNew } from "@/lib/editor/nodes/media/MediaComponents";

interface MediaAttrs {
  src: string;
  alt?: string;
  type: "image" | "video" | "audio";
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: MediaAspectRatios;
  objectFit?: MediaObjectFits;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    media: {
      insertMedia: (options: {
        src: string;
        type: "image" | "video" | "audio";
        aspectRatio?: MediaAspectRatios;
        objectFit?: MediaObjectFits;
        width?: number;
        height?: number;
        alt?: string;
        caption?: string;
      }) => ReturnType;
      // Add this new command for bulk insertion
      insertMultipleMedia: (
        mediaItems: Array<{
          src: string;
          type: "image" | "video" | "audio";
          aspectRatio?: MediaAspectRatios;
          objectFit?: MediaObjectFits;
          width?: number;
          height?: number;
          alt?: string;
          caption?: string;
        }>
      ) => ReturnType;
    };
  }
}

const PenstackMedia = Node.create({
  name: "penstackMedia",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: "",
        renderHTML: (attrs) => ({ src: attrs.src }),
        parseHTML: (element) => element.getAttribute("src") || "",
      },
      alt: {
        default: null,
        renderHTML: (attrs) => (attrs.alt ? { alt: attrs.alt } : {}),
        parseHTML: (element) => element.getAttribute("alt"),
      },
      type: {
        default: "image",
        renderHTML: (attrs) => ({ "data-media-type": attrs.type }),
        parseHTML: (element) => {
          const type = element.getAttribute("data-media-type");
          return ["image", "video", "audio"].includes(type as string)
            ? type
            : "image";
        },
      },
      caption: {
        default: null,
        renderHTML: (attrs) =>
          attrs.caption ? { "data-media-caption": attrs.caption } : {},
        parseHTML: (element) => element.getAttribute("data-media-caption"),
      },
      width: {
        default: 300,
        renderHTML: (attrs) => ({ "data-media-width": attrs.width }),
        parseHTML: (element) => {
          const width = element.getAttribute("data-media-width");
          return width ? parseInt(width, 10) : 300;
        },
      },
      height: {
        default: 400,
        renderHTML: (attrs) => ({ "data-media-height": attrs.height }),
        parseHTML: (element) => {
          const height = element.getAttribute("data-media-height");
          return height ? parseInt(height, 10) : 400;
        },
      },
      aspectRatio: {
        default: "3/4",
        renderHTML: (attrs) => ({
          "data-media-aspect-ratio": attrs.aspectRatio,
        }),
        parseHTML: (element) => {
          const ratio = element.getAttribute("data-media-aspect-ratio");
          const validRatios = [
            "16/9",
            "4/3",
            "3/4",
            "1/1",
            "3/2",
            "2/3",
            "auto",
          ];
          return validRatios.includes(ratio as string) ? ratio : "3/4";
        },
      },
      objectFit: {
        default: "cover",
        renderHTML: (attrs) => ({ "data-media-object-fit": attrs.objectFit }),
        parseHTML: (element) => {
          const fit = element.getAttribute("data-media-object-fit");
          const validFits = ["cover", "contain", "fill", "scale-down", "none"];
          return validFits.includes(fit as string) ? fit : "cover";
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="media"]',
        getAttrs: (element) => {
          const src = element.getAttribute("src");
          return src ? {} : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "media" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaComponentNew);
  },

  addCommands() {
    return {
      insertMedia:
        (attributes: Partial<MediaAttrs>) =>
        ({ commands, state }) => {
          if (!attributes.src) {
            console.warn("Media insertion requires src attribute");
            return false;
          }

          // Get current cursor position
          const { from } = state.selection;

          return commands.insertContentAt(from, {
            type: this.name,
            attrs: attributes,
          });
        },

      // New command for bulk insertion
      insertMultipleMedia:
        (mediaItems: Array<Partial<MediaAttrs>>) =>
        ({ commands, chain, state }) => {
          if (!mediaItems.length) {
            console.warn("No media items to insert");
            return false;
          }

          // Validate all items have src
          const validItems = mediaItems.filter((item) => {
            if (!item.src) {
              console.warn("Skipping media item without src:", item);
              return false;
            }
            return true;
          });

          if (!validItems.length) {
            return false;
          }

          // Create content array with all media nodes
          const content = validItems.map((attrs) => ({
            type: this.name,
            attrs,
          }));

          // Insert all at once in a single transaction
          return chain().focus().insertContent(content).run();
        },
    };
  },
});

export default PenstackMedia;
export type { MediaAttrs };
