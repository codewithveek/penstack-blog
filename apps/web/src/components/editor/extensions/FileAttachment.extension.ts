/**
 * FileAttachment — file upload + download link block.
 *
 * Stores file URL, name, size and MIME type. Uses FluxMedia for upload
 * (handled at the React component level via useMediaUpload).
 */

import { Node, mergeAttributes } from "@tiptap/core";

export interface FileAttachmentAttrs {
  src: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileAttachment: {
      setFileAttachment: (attrs: FileAttachmentAttrs) => ReturnType;
    };
  }
}

export const FileAttachmentExtension = Node.create<Record<string, never>>({
  name: "fileAttachment",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "" },
      fileName: { default: "" },
      fileSize: { default: 0 },
      mimeType: { default: "application/octet-stream" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-type='file-attachment']" }];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as FileAttachmentAttrs;
    return [
      "div",
      mergeAttributes({
        "data-type": "file-attachment",
        class: "file-attachment",
      }),
      [
        "a",
        {
          href: attrs.src,
          download: attrs.fileName,
          class: "file-attachment-link",
        },
        ["span", { class: "file-attachment-icon" }, "\uD83D\uDCCE"],
        ["span", { class: "file-attachment-name" }, attrs.fileName],
        [
          "span",
          { class: "file-attachment-meta" },
          `${formatBytes(attrs.fileSize)} · ${attrs.mimeType}`,
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setFileAttachment:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);
  const label = sizes[idx];
  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(1))} ${label ?? "B"}`;
}

export function renderFileAttachment(attrs: FileAttachmentAttrs): string {
  return `<div data-type="file-attachment" class="file-attachment">
  <a href="${esc(attrs.src)}" download="${esc(attrs.fileName)}" class="file-attachment-link">
    <span class="file-attachment-icon">\uD83D\uDCCE</span>
    <span class="file-attachment-name">${escHtml(attrs.fileName)}</span>
    <span class="file-attachment-meta">${formatBytes(attrs.fileSize)} · ${escHtml(attrs.mimeType)}</span>
  </a>
</div>`;
}

function esc(v: string): string {
  return v.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escHtml(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
