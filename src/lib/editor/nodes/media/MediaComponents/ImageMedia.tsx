// components/ImageMedia.tsx
import { VStack } from "@chakra-ui/react";
import { useEffect } from "react";
import { MediaError } from "./MediaError";
import { MediaFields } from "./MediaFields";
import { ResizableImage } from "./ResizableImage";
import {
  useMediaAttrs,
  useMediaUI,
  useMediaActions,
} from "@/lib/editor/stores/mediaStore";
import { MediaAttrs } from "@/lib/editor/extensions/media-ext";

type ImageMediaProps = {
  // Initial props to set up the store
  initialAttrs?: MediaAttrs;
  isEditing?: boolean;
  selected?: boolean;
  // Callback for external updates (optional)
  onAttrsChange?: (attrs: MediaAttrs) => void;
};

export const ImageMedia = ({
  initialAttrs,
  isEditing = false,
  selected = false,
  onAttrsChange,
}: ImageMediaProps) => {
  const mediaAttrs = useMediaAttrs();
  const { imageError } = useMediaUI();
  const { updateAttrs, setEditing, setSelected, resetImageState } =
    useMediaActions();

  // Initialize store with initial attributes
  useEffect(() => {
    if (initialAttrs) {
      updateAttrs(initialAttrs);
    }
  }, [initialAttrs, updateAttrs]);

  // Sync editing and selected state
  useEffect(() => {
    setEditing(isEditing);
    setSelected(selected);
  }, [isEditing, selected, setEditing, setSelected]);

  // Notify parent of attribute changes
  //   useEffect(() => {
  //     if (onAttrsChange) {
  //       onAttrsChange(mediaAttrs);
  //     }
  //   }, [mediaAttrs, onAttrsChange]);

  // Handle retry for image errors
  const handleRetry = () => {
    resetImageState();
  };

  if (imageError) {
    return <MediaError type="image" onRetry={handleRetry} />;
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Editing Controls
      {isEditing && <MediaFields />} */}

      {/* Resizable Image Display */}
      <ResizableImage />
    </VStack>
  );
};
