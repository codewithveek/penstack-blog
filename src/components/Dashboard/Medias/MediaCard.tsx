import React, { memo, useState, useRef } from "react";
import {
  LuFile,
  LuImage,
  LuVideo,
  LuMusic,
  LuFileText,
  LuEye,
  LuSquareCheck,
  LuSquare,
  LuPlay,
  LuPause,
} from "react-icons/lu";
import { Box, Button, Card, HStack, IconButton, VStack, Flex, Text, Progress, Tooltip } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { formatBytes } from "@/utils";
import { Image } from "@chakra-ui/react";
import { MediaResponse } from "@/types";
import FilePreview from "./FilePreview";

interface MediaCardProps {
  media: MediaResponse;
  onSelect?: (media: MediaResponse) => void;
  selected?: boolean;
  canSelect?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onSelect,
  selected,
  canSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [mediaToPreview, setMediaToPreview] = useState<MediaResponse | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const cardBgColor = useColorModeValue("white", "gray.800");
  const hoverBgColor = useColorModeValue("gray.50", "gray.750");
  const flexBgColor = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const selectedBorderColor = useColorModeValue("brand.500", "brand.400");
  const overlayBg = useColorModeValue(
    "rgba(255, 255, 255, 0.95)",
    "rgba(26, 32, 44, 0.95)"
  );

  const getIcon = (size = 24) => {
    const iconProps = { size };
    switch (media.type) {
      case "image":
        return <LuImage {...iconProps} />;
      case "video":
        return <LuVideo {...iconProps} />;
      case "audio":
        return <LuMusic {...iconProps} />;
      case "pdf":
        return <LuFileText {...iconProps} />;
      default:
        return <LuFile {...iconProps} />;
    }
  };

  const handleSelectClick = () => {
    if (!canSelect) return;
    onSelect?.(media);
  };

  const handlePreviewClick = (media: MediaResponse) => {
    setMediaToPreview(media);
    setOpen(true);
  };

  const handleAudioToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
  };

  return (
    <>
      {mediaToPreview && (
        <FilePreview open={open} onOpenChange={onOpenChange} file={mediaToPreview} />
      )}

      <Card.Root
        pos="relative"
        w="full"
        h={280}
        overflow="hidden"
        borderWidth="2px"
        borderColor={selected ? selectedBorderColor : borderColor}
        boxShadow={selected ? "lg" : "sm"}
        onClick={handleSelectClick}
        sx={{
          "&:hover": {
            ".media-card-select": canSelect
              ? {
                  opacity: 1,
                  transform: "scale(1)",
                }
              : {},
            ".media-card-overlay": {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
        _hover={{
          boxShadow: "md",
          borderColor: selected ? selectedBorderColor : "gray.300",
          bg: hoverBgColor,
        }}
        bg={cardBgColor}
        cursor="pointer"
        transition="all 0.2s ease"
      >
        <Card.Body pos="relative" p={3} bg="transparent">
          <Box
            pos="absolute"
            top={3}
            right={3}
            opacity={selected ? 1 : 0}
            transform={selected ? "scale(1)" : "scale(0.8)"}
            className="media-card-select"
            transition="all 0.2s ease"
            zIndex={10}
          >
            <IconButton
              size="sm"
              aria-label="Select"
              colorPalette={selected ? "brand" : "gray"}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(media);
              }}
              boxShadow="md"
            >
              {selected ? <LuSquareCheck size={18} /> : <LuSquare size={18} />}
            </IconButton>
          </Box>

          <VStack
            transition="all 0.2s ease"
            opacity={0}
            bottom={0}
            right={0}
            position="absolute"
            left={0}
            p={3}
            className="media-card-overlay"
            bg={overlayBg}
            transform="translateY(10px)"
            backdropFilter="blur(8px)"
            zIndex={5}
          >
            <Button
              size="sm"
              variant="solid"
              colorPalette="brand"
              onClick={(e) => {
                e.stopPropagation();
                handlePreviewClick(media);
              }}
              w="full"
            >
              <LuEye /> Preview
            </Button>
          </VStack>

          {media.type === "image" && (
            <Box rounded="lg" aspectRatio={16 / 9} overflow="hidden">
              <Image
                src={media.thumbnail || media.url}
                alt={media.alt_text || media.name}
                w="full"
                h="full"
                objectFit="cover"
                transition="transform 0.2s"
                _hover={{ transform: "scale(1.05)" }}
              />
            </Box>
          )}

          {media.type === "video" && (
            <Box
              rounded="lg"
              position="relative"
              aspectRatio={16 / 9}
              overflow="hidden"
            >
              <Box
                as="video"
                src={media.url}
                poster={media.thumbnail ?? ""}
                w="full"
                h="full"
                objectFit="cover"
              />
              <Box
                pos="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                bg="blackAlpha.600"
                rounded="full"
                p={3}
              >
                <LuPlay size={24} color="white" />
              </Box>
            </Box>
          )}

          {media.type === "audio" && (
            <VStack
              rounded="lg"
              bg={flexBgColor}
              align="center"
              justify="center"
              h={200}
              gap={4}
              position="relative"
            >
              <audio
                ref={audioRef}
                src={media.url}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={handleAudioEnded}
              />
              <Box
                as={LuMusic}
                size={48}
                color={useColorModeValue("brand.500", "brand.300")}
              />
              <IconButton
                aria-label={isPlaying ? "Pause" : "Play"}
                colorPalette="brand"
                rounded="full"
                size="lg"
                onClick={handleAudioToggle}
              >
                {isPlaying ? <LuPause /> : <LuPlay />}
              </IconButton>
              {isPlaying && (
                <Box w="80%" px={4}>
                  <Progress.Root
                    value={audioProgress}
                    size="sm"
                    colorPalette="brand"
                    rounded="full"
                  />
                </Box>
              )}
            </VStack>
          )}

          {media.type !== "video" &&
            media.type !== "image" &&
            media.type !== "audio" && (
              <Flex
                rounded="lg"
                bg={flexBgColor}
                align="center"
                justify="center"
                h={200}
                flexDirection="column"
                gap={3}
              >
                {getIcon(48)}
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  {media.type.toUpperCase()}
                </Text>
              </Flex>
            )}
        </Card.Body>

        <Card.Footer p={3} pt={2} borderTop="1px" borderColor={borderColor}>
          <VStack gap={1} w="full" align="start">
            <Tooltip.Root content={media.name} placement="top" hasArrow>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                truncate
                w="full"
                color={useColorModeValue("gray.700", "gray.200")}
              >
                {media.name}
              </Text>
            </Tooltip.Root>
            <HStack
              fontSize="xs"
              color={useColorModeValue("gray.500", "gray.400")}
              gap={2}
            >
              <Text>{formatBytes(media.size)}</Text>
              {media.width && media.height && (
                <>
                  <Text>•</Text>
                  <Text>
                    {media.width} × {media.height}
                  </Text>
                </>
              )}
            </HStack>
          </VStack>
        </Card.Footer>
      </Card.Root>
    </>
  );
};

MediaCard.displayName = "MediaCard";
