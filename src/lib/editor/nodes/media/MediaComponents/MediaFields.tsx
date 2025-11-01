import {
  Input,
  Select,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
  Text,
  Stack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { useMediaAttrs, useMediaActions } from "../../../stores/mediaStore";
import { MediaAspectRatios, MediaObjectFits } from "../../../types";
import { SectionCard } from "@/components//Dashboard/SectionCard";
import { usePenstackEditorStore } from "@/state/penstack-editor";

// Memoized aspect ratio options
const ASPECT_RATIO_OPTIONS = [
  { value: "16/9", label: "16:9 (Video)" },
  { value: "4/3", label: "4:3 (Standard)" },
  { value: "3/4", label: "3:4 (Portrait)" },
  { value: "1/1", label: "1:1 (Square)" },
  { value: "3/2", label: "3:2 (Photo)" },
  { value: "2/3", label: "2:3 (Tall)" },
  { value: "auto", label: "Auto" },
] as const;

// Memoized object fit options
const OBJECT_FIT_OPTIONS = [
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
  { value: "fill", label: "Fill" },
  { value: "scale-down", label: "Scale Down" },
  { value: "none", label: "None" },
] as const;

export const MediaFields = () => {
  const { src, alt, caption, width, height, aspectRatio, objectFit } =
    useMediaAttrs();
  const { updateAttrs } = useMediaActions();
  const editor = usePenstackEditorStore((state) => state.editor);

  // Optimized update handlers
  const handleSrcChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateAttrs({ src: e.target.value });
    },
    [updateAttrs]
  );

  const handleAltChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateAttrs({ alt: e.target.value });
    },
    [updateAttrs]
  );

  const handleCaptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateAttrs({ caption: e.target.value });
    },
    [updateAttrs]
  );

  const handleWidthChange = useCallback(
    (valueString: string) => {
      const value = parseInt(valueString);
      if (!isNaN(value) && value > 0) {
        updateAttrs({ width: value });
      }
    },
    [updateAttrs]
  );

  const handleHeightChange = useCallback(
    (valueString: string) => {
      const value = parseInt(valueString);
      if (!isNaN(value) && value > 0) {
        updateAttrs({ height: value });
      }
    },
    [updateAttrs]
  );

  const handleAspectRatioChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateAttrs({ aspectRatio: e.target.value as MediaAspectRatios });
    },
    [updateAttrs]
  );

  const handleObjectFitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateAttrs({ objectFit: e.target.value as MediaObjectFits });
    },
    [updateAttrs]
  );

  return (
    <SectionCard title="Image Settings" roundedTop="none">
      <Stack spacing={3} px={4} py={3}>
        {JSON.stringify(editor?.getAttributes("penstackMedia"), undefined, 2)}
        {/* Source URL */}
        <VStack align="stretch" spacing={1}>
          <Text fontSize="xs" fontWeight="medium" color="gray.600">
            Source URL
          </Text>
          <Input
            size="sm"
            value={src || ""}
            onChange={handleSrcChange}
            placeholder="Enter image URL"
          />
        </VStack>

        {/* Alt Text */}
        <VStack align="stretch" spacing={1}>
          <Text fontSize="xs" fontWeight="medium" color="gray.600">
            Alt Text
          </Text>
          <Input
            size="sm"
            value={alt || ""}
            onChange={handleAltChange}
            placeholder="Enter alt text"
          />
        </VStack>

        {/* Caption */}
        <VStack align="stretch" spacing={1}>
          <Text fontSize="xs" fontWeight="medium" color="gray.600">
            Caption
          </Text>
          <Input
            size="sm"
            value={caption || ""}
            onChange={handleCaptionChange}
            placeholder="Enter caption"
          />
        </VStack>

        {/* Width and Height - Side by side */}
        <HStack spacing={4} width="100%">
          <VStack align="stretch" spacing={1} flex={1}>
            <Text fontSize="xs" fontWeight="medium" color="gray.600">
              Width (px)
            </Text>
            <NumberInput
              size="sm"
              value={width}
              min={50}
              max={2000}
              onChange={handleWidthChange}
            >
              <NumberInputField />
            </NumberInput>
          </VStack>

          <VStack align="stretch" spacing={1} flex={1}>
            <Text fontSize="xs" fontWeight="medium" color="gray.600">
              Height (px)
            </Text>
            <NumberInput
              size="sm"
              value={height}
              min={50}
              max={2000}
              onChange={handleHeightChange}
            >
              <NumberInputField />
            </NumberInput>
          </VStack>
        </HStack>

        {/* Aspect Ratio */}
        <VStack align="stretch" spacing={1}>
          <Text fontSize="xs" fontWeight="medium" color="gray.600">
            Aspect Ratio
          </Text>
          <Select
            size="sm"
            value={aspectRatio}
            onChange={handleAspectRatioChange}
          >
            {ASPECT_RATIO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </VStack>

        {/* Object Fit */}
        <VStack align="stretch" spacing={1}>
          <Text fontSize="xs" fontWeight="medium" color="gray.600">
            Object Fit
          </Text>
          <Select size="sm" value={objectFit} onChange={handleObjectFitChange}>
            {OBJECT_FIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </VStack>
      </Stack>
    </SectionCard>
  );
};
