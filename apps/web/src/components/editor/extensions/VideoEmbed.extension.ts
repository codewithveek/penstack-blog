/**
 * VideoEmbed — custom Tiptap block node extension.
 *
 * Embeds YouTube, Vimeo, or direct video URLs.
 * Per AGENTS.md: exports extension, attribute type, renderer function.
 */

import { Node, mergeAttributes } from "@tiptap/core";

export interface VideoEmbedAttrs {
  src: string;
  provider: "youtube" | "vimeo" | "direct";
  caption: string;
  width: number | null;
  height: number | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (attrs: Partial<VideoEmbedAttrs>) => ReturnType;
    };
  }
}

function extractVideoId(src: string): { provider: "youtube" | "vimeo" | "direct"; embedUrl: string } {
  const ytMatch = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch?.[1]) {
    return { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }
  const vimeoMatch = src.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch?.[1]) {
    return { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  return { provider: "direct", embedUrl: src };
}

export const VideoEmbedExtension = Node.create<Record<string, never>>({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "" },
      provider: { default: "direct" },
      caption: { default: "" },
      width: { default: null },
      height: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "figure[data-type='video-embed']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as VideoEmbedAttrs;
    const { embedUrl, provider } = extractVideoId(attrs.src);

    const inner =
      provider === "direct"
        ? [
            "video",
            mergeAttributes({
              src: embedUrl,
              controls: "true",
              ...(attrs.width ? { width: attrs.width } : {}),
              ...(attrs.height ? { height: attrs.height } : {}),
            }),
          ]
        : [
            "iframe",
            mergeAttributes({
              src: embedUrl,
              width: attrs.width ?? 560,
              height: attrs.height ?? 315,
              frameborder: "0",
              allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              allowfullscreen: "true",
            }),
          ];

    const figcaption = attrs.caption ? ["figcaption", {}, attrs.caption] : null;

    return [
      "figure",
      mergeAttributes({ "data-type": "video-embed", class: `video-${provider}` }),
      ["div", { class: "video-wrapper" }, inner],
      ...(figcaption ? [figcaption] : []),
    ];
  },

  addCommands() {
    return {
      setVideoEmbed:
        (attrs) =>
        ({ commands }) => {
          const { provider } = extractVideoId(attrs.src ?? "");
          return commands.insertContent({
            type: this.name,
            attrs: { ...attrs, provider },
          });
        },
    };
  },
});

export function renderVideoEmbed(attrs: VideoEmbedAttrs): string {
  const { embedUrl, provider } = extractVideoId(attrs.src);
  const w = attrs.width ?? 560;
  const h = attrs.height ?? 315;

  const inner =
    provider === "direct"
      ? `<video src="${esc(embedUrl)}" controls${attrs.width ? ` width="${w}"` : ""}${attrs.height ? ` height="${h}"` : ""}></video>`
      : `<iframe src="${esc(embedUrl)}" width="${w}" height="${h}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  const caption = attrs.caption ? `<figcaption>${escHtml(attrs.caption)}</figcaption>` : "";

  return `<figure data-type="video-embed" class="video-${provider}"><div class="video-wrapper">${inner}</div>${caption}</figure>`;
}

function esc(v: string): string {
  return v.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
