import { Image } from "@chakra-ui/react";
// components/ResizableImage.tsx

import { useCallback, useMemo } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import {
  useMediaAttrs,
  useMediaUI,
  useMediaActions,
} from "../../../stores/mediaStore";
import { MediaLoading } from "./MediaLoading";
import { MediaAspectRatios, MediaObjectFits } from "../../../types";

const getAspectRatioClass = (aspectRatio?: MediaAspectRatios): string => {
  const ratioMap: Record<string, string> = {
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    "3/4": "aspect-[3/4]",
    "1/1": "aspect-square",
    "3/2": "aspect-[3/2]",
    "2/3": "aspect-[2/3]",
    auto: "aspect-auto",
  };
  return ratioMap[aspectRatio || "3/4"] || "aspect-[3/4]";
};

const getObjectFitClass = (objectFit?: MediaObjectFits): string => {
  const fitMap: Record<string, string> = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    "scale-down": "object-scale-down",
    none: "object-none",
  };
  return fitMap[objectFit || "cover"] || "object-cover";
};

export const ResizableImage = () => {
  const {
    src,
    alt,
    caption,
    width = 300,
    height = 400,
    aspectRatio,
    objectFit,
  } = useMediaAttrs();
  const { isEditing, selected, imageLoading } = useMediaUI();
  const { updateAttrs, setImageLoading, resetImageState } = useMediaActions();

  // Memoized classes
  const aspectClass = useMemo(
    () => getAspectRatioClass(aspectRatio),
    [aspectRatio]
  );

  const objectFitClass = useMemo(
    () => getObjectFitClass(objectFit),
    [objectFit]
  );

  const containerClasses = useMemo(() => {
    let classes = `overflow-hidden rounded-md relative ${aspectClass}`;
    if (isEditing && selected) {
      classes += " ring-2 ring-blue-500 ring-offset-2";
    }
    return classes;
  }, [aspectClass, isEditing, selected]);

  // Image event handlers
  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, [setImageLoading]);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
  }, [setImageLoading]);

  // Resize handlers
  const handleResize = useCallback(
    (
      event: React.SyntheticEvent,
      { size }: { size: { width: number; height: number } }
    ) => {
      updateAttrs({
        width: Math.round(size.width),
        height: Math.round(size.height),
      });
    },
    [updateAttrs]
  );

  const handleResizeStop = useCallback(
    (
      event: React.SyntheticEvent,
      { size }: { size: { width: number; height: number } }
    ) => {
      // Final update on resize stop for better performance
      updateAttrs({
        width: Math.round(size.width),
        height: Math.round(size.height),
      });
    },
    [updateAttrs]
  );

  // Resizable configuration
  const resizableProps = {
    width,
    height,
    onResize: handleResize,
    onResizeStop: handleResizeStop,
    minConstraints: [50, 50] as [number, number],
    maxConstraints: [2000, 2000] as [number, number],
    resizeHandles: ["se", "sw", "ne", "nw"] as Array<
      "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne"
    >,
    handleSize: [8, 8] as [number, number],
    // Custom handle styles for better UX
    handleStyle: {
      se: {
        bottom: "-4px",
        right: "-4px",
        cursor: "se-resize",
        backgroundColor: "#3182ce",
        border: "1px solid #2c5aa0",
        borderRadius: "2px",
      },
      sw: {
        bottom: "-4px",
        left: "-4px",
        cursor: "sw-resize",
        backgroundColor: "#3182ce",
        border: "1px solid #2c5aa0",
        borderRadius: "2px",
      },
      ne: {
        top: "-4px",
        right: "-4px",
        cursor: "ne-resize",
        backgroundColor: "#3182ce",
        border: "1px solid #2c5aa0",
        borderRadius: "2px",
      },
      nw: {
        top: "-4px",
        left: "-4px",
        cursor: "nw-resize",
        backgroundColor: "#3182ce",
        border: "1px solid #2c5aa0",
        borderRadius: "2px",
      },
    },
  };

  const ImageContent = (
    <figure className="shrink-0">
      <div className={containerClasses}>
        {imageLoading && (
          <div className="absolute inset-0 z-10">
            <MediaLoading type="image" />
          </div>
        )}
        <Image
          src={src}
          alt={alt || "Media content"}
          className={`h-full w-full ${objectFitClass}`}
          width={width}
          height={height}
          maxW={"full"}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="text-muted-foreground pt-2 text-xs">
          {caption}
        </figcaption>
      )}
    </figure>
  );

  // Return resizable version when editing, regular version otherwise
  if (isEditing && selected) {
    return <>{ImageContent}</>;
  }

  return <div style={{ width, height }}>{ImageContent}</div>;
};
