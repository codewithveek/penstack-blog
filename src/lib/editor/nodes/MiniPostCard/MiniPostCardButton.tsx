import { Button } from "@chakra-ui/react";
import { Editor } from "@tiptap/react";
import { LuFileStack, LuSearch } from "react-icons/lu";

export const MiniPostCardButton = ({ editor }: { editor: Editor }) => {
  return (
    <Button
      size="sm"
      variant={editor.isActive("postCard") ? "solid" : "outline"}
      onClick={() => editor.commands.insertPostCard()}
    >
      <LuFileStack /> Insert Post
    </Button>
  );
};
