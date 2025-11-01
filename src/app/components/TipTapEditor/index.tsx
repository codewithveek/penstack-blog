import { useEditor } from "@tiptap/react";
import { Flex, Hide } from "@chakra-ui/react";

import { useMemo } from "react";

import MenuBar from "./MenuBar";
import { SidebarContent } from "./Sidebar";
import { EditorWrapper } from "./Wrapper";
import EditorHeader from "./Header";
import ContentArea from "./ContentArea";
import React from "react";
import debounce from "lodash/debounce";
import { usePenstackEditorStore } from "@/state/penstack-editor";
import { extensions } from "@/lib/editor/extensions";

function TipTapEditor({
  onUpdate,
  initialContent,
}: {
  onUpdate?: (content: { html: string; text?: string }) => void;
  initialContent?: string;
}) {
  const setEditor = usePenstackEditorStore((state) => state.setEditor);
  const setEditorContent = usePenstackEditorStore(
    (state) => state.setEditorContent
  );
  const debouncedUpdate = useMemo(
    () =>
      debounce((content: { html: string; text?: string }) => {
        onUpdate?.(content);
        setEditorContent(content);
      }, 1000),
    [onUpdate, setEditorContent]
  );
  const editor = useEditor({
    editorProps: { attributes: { class: "penstack-post-editor" } },
    enablePasteRules: true,
    extensions: extensions,
    content: initialContent,
    onCreate: ({ editor }) => {
      setEditor(editor);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      debouncedUpdate({
        html,
        text,
      });
    },
  });
  return (
    <>
      <EditorHeader />
      <Flex gap={4} py={4} px={{ base: 3, md: 4 }}>
        <EditorWrapper>
          <MenuBar editor={editor} />
          <ContentArea editor={editor} />

          {/* <FloatingMenu editor={editor}>
            <MenuBar editor={editor} />
          </FloatingMenu> */}
        </EditorWrapper>
        <Hide below="lg">
          <SidebarContent />
        </Hide>
        {/* <Box display={{ base: "none", lg: "block" }} maxW={320}></Box> */}
      </Flex>
    </>
  );
}
export default TipTapEditor;
