import { Extension } from "@tiptap/core";
import Suggestion, {
  type SuggestionOptions,
  type SuggestionProps,
  type SuggestionKeyDownProps,
} from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { SlashCommandList, type SlashCommandItem } from "../SlashCommandList";
// Import so TypeScript picks up the Commands<> module augmentation from custom extensions
import type {} from "./ImageBlock.extension";
import type {} from "./VideoEmbed.extension";
import type {} from "./CalloutBlock.extension";
import type {} from "./HTMLBlock.extension";
import type {} from "./DividerBlock.extension";
import type {} from "./ToggleBlock.extension";
import type {} from "./NewsletterBox.extension";
import type {} from "./RelatedPostBlock.extension";
import type {} from "./FileAttachment.extension";
import type {} from "./ProductCard.extension";

const COMMANDS: SlashCommandItem[] = [
  {
    title: "Heading 1",
    icon: "H1",
    description: "Large section heading",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    icon: "H2",
    description: "Medium section heading",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    icon: "H3",
    description: "Small section heading",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: "Bullet list",
    icon: "≡",
    description: "Unordered list",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered list",
    icon: "①",
    description: "Ordered list",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    icon: '"',
    description: "Blockquote",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code block",
    icon: "</>",
    description: "Syntax-highlighted code",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Divider",
    icon: "—",
    description: "Horizontal rule",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "Image",
    icon: "🖼",
    description: "Insert an image block",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setImageBlock({ src: "", alt: "", caption: "" })
        .run();
    },
  },
  {
    title: "Video",
    icon: "🎬",
    description: "Embed a video (YouTube, Vimeo, or direct)",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setVideoEmbed({ src: "" })
        .run();
    },
  },
  {
    title: "Callout",
    icon: "💡",
    description: "Highlighted callout box",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setCalloutBlock({ type: "info" })
        .run();
    },
  },
  {
    title: "HTML",
    icon: "{ }",
    description: "Raw HTML block",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHtmlBlock({ content: "" })
        .run();
    },
  },
  {
    title: "Styled divider",
    icon: "···",
    description: "Styled content divider",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setDividerBlock({})
        .run();
    },
  },
  {
    title: "Toggle",
    icon: "▸",
    description: "Collapsible toggle section",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setToggleBlock({})
        .run();
    },
  },
  {
    title: "Newsletter",
    icon: "📧",
    description: "Newsletter subscribe form",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNewsletterBox({})
        .run();
    },
  },
  {
    title: "Related post",
    icon: "🔗",
    description: '"Read also" post card',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setRelatedPostBlock({})
        .run();
    },
  },
  {
    title: "File attachment",
    icon: "📎",
    description: "Attach a downloadable file",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setFileAttachment({ src: "", fileName: "", fileSize: 0, mimeType: "" })
        .run();
    },
  },
  {
    title: "Table",
    icon: "▦",
    description: "Insert a table",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: "Product card",
    icon: "🛒",
    description: "Product review / recommendation card",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setProductCard({})
        .run();
    },
  },
];

export const SlashCommandExtension = Extension.create({
  name: "slashCommand",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: Parameters<NonNullable<SuggestionOptions["command"]>>[0]) => {
          (props as { command: SlashCommandItem["command"] }).command({
            editor,
            range,
          });
        },
        items: ({ query }: { query: string }) => {
          return COMMANDS.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          );
        },
        render: () => {
          let component: ReactRenderer | null = null;
          let popup: TippyInstance[] | null = null;

          return {
            onStart(props: SuggestionProps<SlashCommandItem>) {
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              });

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },
            onUpdate(props: SuggestionProps<SlashCommandItem>) {
              component?.updateProps(props);
              if (props.clientRect) {
                popup?.[0]?.setProps({
                  getReferenceClientRect: props.clientRect as () => DOMRect,
                });
              }
            },
            onKeyDown(props: SuggestionKeyDownProps) {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }
              const ref = component?.ref as {
                onKeyDown?: (p: unknown) => boolean;
              } | null;
              return ref?.onKeyDown?.(props) ?? false;
            },
            onExit() {
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      } satisfies Partial<SuggestionOptions>,
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...(this.options.suggestion as Omit<SuggestionOptions, "editor">),
      }),
    ];
  },
});
