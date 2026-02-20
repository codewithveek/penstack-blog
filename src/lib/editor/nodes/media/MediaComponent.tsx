import { Image } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import {
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuTrash2,
  LuImage,
} from "react-icons/lu";


interface MediaComponentProps extends NodeViewProps {
  isRendering?: boolean;
}

export const MediaComponent: React.FC<MediaComponentProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}) => {
  const handleAlign = useCallback(
    (position: string) => {
      updateAttributes({ position });
    },
    [updateAttributes]
  );

  if (!node.attrs.url) {
    return (
      <NodeViewWrapper>
        <div className="flex items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 transition-colors hover:bg-gray-100">
          <button
            onClick={() => {
              /* Implement media modal open */
            }}
            className="px-6 py-3 text-sm font-medium text-brand-600 bg-white rounded-md shadow-sm hover:bg-brand-50 transition-colors"
          >
            <LuImage className="w-5 h-5 mr-2 inline-block" />
            Insert Media
          </button>
        </div>
      </NodeViewWrapper>
    );
  }

  const mediaContent = (
    <div className="relative">
      {node.attrs.type === "image" ? (
        <Image
          src={node.attrs.url}
          alt={node.attrs.alt || ""}
          className="w-full h-auto object-contain"
          loading="lazy"
        />
      ) : (
        <div className="aspect-w-16 aspect-h-9">
          <video
            controls
            className="w-full h-full"
            controlsList="nodownload"
            preload="metadata"
          >
            <source src={node.attrs.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );

  return (
    <NodeViewWrapper>
      <div
        className={`group relative ${selected ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
        style={{
          marginLeft: node.attrs.position === "center" ? "auto" : undefined,
          marginRight: node.attrs.position === "center" ? "auto" : undefined,
        }}
      >
        {/* Toolbar */}
        <div
          className="absolute -top-12 left-0 opacity-0 group-hover:opacity-100 transition-opacity
            flex items-center gap-1 bg-white shadow-lg rounded-lg p-1.5 z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            onClick={() => handleAlign("left")}
            className={`p-1.5 rounded hover:bg-gray-100 ${node.attrs.position === "left" ? "bg-gray-200" : ""}`}
            title="Align left"
          >
            <LuAlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAlign("center")}
            className={`p-1.5 rounded hover:bg-gray-100 ${node.attrs.position === "center" ? "bg-gray-200" : ""}`}
            title="Center"
          >
            <LuAlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAlign("right")}
            className={`p-1.5 rounded hover:bg-gray-100 ${node.attrs.position === "right" ? "bg-gray-200" : ""}`}
            title="Align right"
          >
            <LuAlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteNode()}
            className="p-1.5 rounded hover:bg-red-100 text-red-600"
            title="Delete"
          >
            <LuTrash2 className="w-4 h-4" />
          </button>
        </div>

        {mediaContent}

        {/* Caption */}
        {node.attrs.caption && (
          <figcaption className="text-sm text-gray-600 mt-2 text-center">
            {node.attrs.caption}
          </figcaption>
        )}
      </div>
    </NodeViewWrapper>
  );
};
MediaComponent.displayName = "MediaComponent";