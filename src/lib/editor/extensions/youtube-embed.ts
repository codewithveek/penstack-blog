// YouTubeExtension.ts
import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";
import { PenstackYouTubeEmbed } from "@/components//Renderers/YoutubeEmbedRenderer";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      insertYouTube: (videoId: string) => ReturnType;
    };
  }
}

export const PenstackYouTubeExtension = Node.create({
  name: "penstack-youtube",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      videoId: { default: null },
      title: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="penstack-youtube-embed"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "penstack-youtube-embed",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PenstackYouTubeEmbed);
  },

  addCommands() {
    return {
      insertYouTube:
        (videoId: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { videoId },
          });
        },
    };
  },

  addPasteRules() {
    return [
      {
        find: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/g,
        handler: ({ match, chain, range }) => {
          const videoId = match[1];

          if (videoId) {
            chain()
              // First delete the pasted content
              .deleteRange(range)
              // Then insert the YouTube embed
              .insertContent({
                type: this.name,
                attrs: { videoId },
              })
              .run();
          }
        },
      },
    ];
  },
});
