"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useEffect, useCallback } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { SlashCommandExtension } from "./extensions/SlashCommand.extension";
import "./editor.css";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content?: object;
  onChange?: (json: object) => void;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  editable = true,
}: RichTextEditorProps) {
  const handleUpdate = useCallback(
    ({
      editor,
    }: {
      editor: ReturnType<typeof useEditor> extends null
        ? never
        : NonNullable<ReturnType<typeof useEditor>>;
    }) => {
      onChange?.(editor.getJSON());
    },
    [onChange]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Placeholder.configure({
        placeholder: "Start writing, or press / for commands…",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      Typography,
      CharacterCount,
      CodeBlockLowlight.configure({ lowlight }),
      SlashCommandExtension,
    ],
    content: content && Object.keys(content).length > 0 ? content : undefined,
    editable,
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: "prose prose-gray max-w-none focus:outline-none min-h-[400px]",
      },
    },
    immediatelyRender: false,
  });

  // Sync external content changes (e.g. loading from API)
  useEffect(() => {
    if (!editor || !content || Object.keys(content).length === 0) return;
    const current = editor.getJSON();
    if (JSON.stringify(current) !== JSON.stringify(content)) {
      editor.commands.setContent(content, false);
    }
    // Only run when content prop changes from outside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="editor-wrapper">
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
      {editable && (
        <p className="mt-2 text-xs text-gray-400 text-right">
          {editor.storage.characterCount?.words() ?? 0} words
        </p>
      )}
    </div>
  );
}
