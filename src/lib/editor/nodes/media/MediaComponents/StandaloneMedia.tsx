import { VStack, HStack, IconButton, Input, Box } from "@chakra-ui/react";

import { useState } from "react";
import { LuPin, LuCheck, LuX } from "react-icons/lu";

export interface StandaloneMediaProps {
  src: string;
  alt?: string;
  type: "image" | "video" | "audio";
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  objectFit?: string;
  showControls?: boolean; // Show edit controls
  onCaptionChange?: (caption: string) => void;
  onAltChange?: (alt: string) => void;
  className?: string;
}

export const StandaloneMedia = ({
  src,
  alt = "",
  type,
  caption = "",
  width = 300,
  height = 400,
  aspectRatio = "3/4",
  objectFit = "cover",
  showControls = false,
  onCaptionChange,
  onAltChange,
  className = "flex-1",
}: StandaloneMediaProps) => {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [tempCaption, setTempCaption] = useState(caption);
  const [tempAlt, setTempAlt] = useState(alt);

  const handleSaveCaption = () => {
    onCaptionChange?.(tempCaption);
    setIsEditingCaption(false);
  };

  const handleCancelEdit = () => {
    setTempCaption(caption);
    setTempAlt(alt);
    setIsEditingCaption(false);
  };

  const renderMediaElement = () => {
    const style = {
      width: `${width}px`,
      height: aspectRatio === "auto" ? "auto" : `${height}px`,
      objectFit: objectFit as any,
      aspectRatio: aspectRatio !== "auto" ? aspectRatio : undefined,
      borderRadius: "8px",
    };

    switch (type) {
      case "image":
        return <img src={src} alt={alt} style={style} className="max-w-full" />;

      case "video":
        return (
          <video src={src} controls style={style} className="max-w-full">
            Your browser does not support the video tag.
          </video>
        );

      case "audio":
        return (
          <audio src={src} controls className="w-full">
            Your browser does not support the audio tag.
          </audio>
        );

      default:
        return null;
    }
  };

  return (
    <VStack gap={2} align="stretch" className={className}>
      {/* Media Element */}
      <Box position="relative">{renderMediaElement()}</Box>

      {/* Caption Display/Edit */}
      {showControls && (
        <VStack gap={2} align="stretch">
          {isEditingCaption ? (
            <VStack gap={2}>
              {type === "image" && (
                <Input
                  placeholder="Alt text"
                  value={tempAlt}
                  onChange={(e) => setTempAlt(e.target.value)}
                  size="sm"
                />
              )}
              <Input
                placeholder="Caption"
                value={tempCaption}
                onChange={(e) => setTempCaption(e.target.value)}
                size="sm"
              />
              <HStack>
                <IconButton
                  aria-label="Save"
                  onClick={handleSaveCaption}
                  size="sm"
                  colorPalette="green"
                >
                  <LuCheck />
                </IconButton>
                <IconButton
                  aria-label="Cancel"
                  onClick={handleCancelEdit}
                  size="sm"
                  variant="ghost"
                >
                  <LuX />
                </IconButton>
              </HStack>
            </VStack>
          ) : (
            <HStack justify="space-between">
              <Box fontSize="sm" color="gray.600" flex="1">
                {caption || "No caption"}
              </Box>
              <IconButton
                aria-label="Edit caption"
                onClick={() => setIsEditingCaption(true)}
                size="sm"
                variant="ghost"
              >
                <LuPin />
              </IconButton>
            </HStack>
          )}
        </VStack>
      )}

      {/* Display caption when controls are hidden */}
      {!showControls && caption && (
        <Box fontSize="sm" color="gray.600" textAlign="center">
          {caption}
        </Box>
      )}
    </VStack>
  );
};
