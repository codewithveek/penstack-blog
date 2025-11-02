import { Editor, EditorContent } from "@tiptap/react";
import React from "react";

function ContentArea({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
export default React.memo(ContentArea);
