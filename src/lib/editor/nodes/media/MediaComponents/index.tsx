import { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { MediaError } from "./MediaError";
import { StandaloneMedia, StandaloneMediaProps } from "./StandaloneMedia";

export interface MediaAttrs {
  src: string;
  alt?: string;
  type: "image" | "video" | "audio";
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  objectFit?: string;
}

export interface MediaNodeViewProps extends Partial<NodeViewProps> {
  node?: NodeViewProps["node"] & {
    attrs: MediaAttrs;
  };
  attrs?: MediaAttrs;
  isEditing?: boolean;
}

export const MediaComponentNew = ({
  node,
  attrs,
  updateAttributes,
  selected = false,
  isEditing = true,
}: MediaNodeViewProps) => {
  const mediaAttrs = isEditing ? node?.attrs : attrs;

  if (!mediaAttrs?.src) {
    const errorContent = <MediaError type="media" />;
    return isEditing ? (
      <NodeViewWrapper as="div" className="p-4">
        {errorContent}
      </NodeViewWrapper>
    ) : (
      <div className="p-4">{errorContent}</div>
    );
  }

  const { src, alt, type, caption, width, height, aspectRatio, objectFit } =
    mediaAttrs;

  const handleCaptionChange = (newCaption: string) => {
    updateAttributes?.({ caption: newCaption });
  };

  const handleAltChange = (newAlt: string) => {
    updateAttributes?.({ alt: newAlt });
  };

  const mediaContent = (
    <StandaloneMedia
      src={src}
      alt={alt}
      type={type}
      caption={caption}
      width={width}
      height={height}
      aspectRatio={aspectRatio}
      objectFit={objectFit}
      showControls={isEditing && selected}
      onCaptionChange={handleCaptionChange}
      onAltChange={handleAltChange}
      className={selected ? "ring-2 ring-blue-500 rounded-lg" : ""}
    />
  );

  return isEditing ? (
    <NodeViewWrapper as="div" className="p-4">
      {mediaContent}
    </NodeViewWrapper>
  ) : (
    <div className="p-4">{mediaContent}</div>
  );
};
