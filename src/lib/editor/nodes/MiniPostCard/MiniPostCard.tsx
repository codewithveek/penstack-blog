import { Card } from "@chakra-ui/react";
import { PostSelect } from "@/types";

import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import React, { useState } from "react";

import { MiniPostCardRenderer } from "@/components//Renderers/MiniPostCardRenderer";

import { SearchPostsComponent } from "./SearchPostsComponent";
import { useColorModeValue } from "@/components/ui/color-mode";

interface MiniPostCardProps extends NodeViewProps {
  isRendering?: boolean;
}

export const MiniPostCard: React.FC<MiniPostCardProps> = ({
  node,
  updateAttributes,
  editor,
  getPos,
}) => {
  const [customTitle, setCustomTitle] = useState(node?.attrs.customTitle || "");

  const borderColor = useColorModeValue("gray.300", "gray.600");

  const selectPost = (selectedPost: PostSelect) => {
    if (typeof getPos === "function") {
      const pos = getPos();
      editor
        .chain()
        .focus()
        .setNodeSelection(pos)
        .command(({ tr }) => {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            postIds: [selectedPost?.post_id].join(","),
          });
          return true;
        })
        .run();
    }
  };
  if (!node.attrs.postIds?.length) {
    return (
      <NodeViewWrapper>
        <Card.Root my={2}>
          <Card.Body
            border="2px"
            borderStyle="dashed"
            borderColor={borderColor}
            rounded="lg"
          >
            <SearchPostsComponent onPostSelect={selectPost} />
          </Card.Body>
        </Card.Root>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <MiniPostCardRenderer
        isEditing
        node={node}
        updateAttributes={updateAttributes}
        inputValue={customTitle}
        onInputChange={(e) => {
          setCustomTitle(e.target.value);
          updateAttributes({ customTitle: e.target.value });
        }}
      />
    </NodeViewWrapper>
  );
};
