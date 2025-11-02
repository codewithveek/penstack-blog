import { Divider, useDisclosure } from "@chakra-ui/react";
import { filterEditorActions } from "@/lib/editor/actions";
import React, { useMemo } from "react";
import { MediaInsert } from "../MediaInsert";
import AccessibleDropdown from "../../../AccessibleDropdown";
import { Editor } from "@tiptap/react";

function EditorActionsDropdown({ editor }: { editor: Editor | null }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dropdownActions = useMemo(
    () =>
      filterEditorActions([
        "Paragraph",
        "Heading 1",
        "Heading 2",
        "Heading 3",
        "Bullet List",
        "Ordered List",
        "Insert Media",
      ]),
    []
  );

  if (!editor) return null;

  return (
    <>
      <AccessibleDropdown
        options={dropdownActions}
        onOpen={onOpen}
        editor={editor}
        defaultValue={dropdownActions[0]}
      />
      <Divider orientation="vertical" h={10} />

      <MediaInsert editor={editor} isOpen={isOpen} onClose={onClose} />
    </>
  );
}
export default EditorActionsDropdown;
