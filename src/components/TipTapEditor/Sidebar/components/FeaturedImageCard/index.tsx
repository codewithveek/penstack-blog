import { useCallback } from "react";
import { MediaResponse } from "@/types";
import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import { ImageCard } from "../ImageCard";

export const FeaturedImageCard = () => {
  const originalFeaturedImage = useEditorPostManagerStore(
    (state) => state.activePost?.featured_image
  );
  const updateField = useEditorPostManagerStore((state) => state.updateField);

  const handleImageSelect = useCallback(
    (media: MediaResponse) => {
      updateField("featured_image_id", media?.id);
    },
    [updateField]
  );

  const handleImageRemove = useCallback(() => {
    updateField("featured_image_id", null);
  }, [updateField]);

  return (
    <>
      <ImageCard
        image={
          originalFeaturedImage?.preview || originalFeaturedImage?.url || ""
        }
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
      />
    </>
  );
};

FeaturedImageCard.displayName = "FeaturedImageCard";
