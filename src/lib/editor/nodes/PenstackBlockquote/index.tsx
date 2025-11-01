import PenstackBlockquoteRenderer from "@/components//Renderers/PenstackBlockquoteRenderer";
import { NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper } from "@tiptap/react";
import { memo, useState } from "react";

interface PenstackBlockquoteComponentProps extends NodeViewProps {}
export const PenstackBlockquoteComponent: React.FC<
  PenstackBlockquoteComponentProps
> = ({ node, updateAttributes }) => {
  return (
    <NodeViewWrapper>
      <PenstackBlockquoteRenderer
        isEditing
        node={node}
        updateAttributes={updateAttributes}
      />
    </NodeViewWrapper>
  );
};
export default memo(PenstackBlockquoteComponent);
