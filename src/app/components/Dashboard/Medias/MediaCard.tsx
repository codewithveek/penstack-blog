import React, { memo, useState } from "react";
import {
  LuFile,
  LuImage,
  LuVideo,
  LuFileAudio,
  LuFileText,
  LuEye,
  LuSquareCheck,
  LuSquare,
} from "react-icons/lu";
import {
  Box,
  Button,
  Card,
  CardBody,
  useDisclosure,
  CardFooter,
  useColorModeValue,
  HStack,
  IconButton,
  VStack,
  Center,
  DarkMode,
  Flex,
  Text,
} from "@chakra-ui/react";
import { formatBytes } from "@/utils";
import { Image } from "@chakra-ui/react";
import { MediaResponse } from "@/types";
import FilePreview from "./FilePreview";

interface MediaCardProps {
  media: MediaResponse;
  onSelect?: (media: MediaResponse) => void;
  selected?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = memo(
  ({ media, onSelect, selected }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [mediaToPreview, setMediaToPreview] = useState<MediaResponse | null>(
      null
    );
    const cardBgColor = useColorModeValue("gray.200", "gray.800");
    const getIcon = () => {
      switch (media.type) {
        case "image":
          return <LuImage />;
        case "video":
          return <LuVideo />;
        case "audio":
          return <LuFileAudio />;
        case "pdf":
          return <LuFileText />;
        default:
          return <LuFile />;
      }
    };

    const flexBgColor = useColorModeValue("gray.100", "gray.800");

    const handleSelectClick = () => {
      onSelect?.(media);
    };
    const handlePreviewClick = (media: MediaResponse) => {
      setMediaToPreview(media);
      onOpen();
    };
    return (
      <>
        <FilePreview isOpen={isOpen} onClose={onClose} file={mediaToPreview!} />

        <Card
          pos={"relative"}
          w={"full"}
          h={250}
          className="bg-gray-200"
          // rounded={"lg"}
          overflow={"hidden"}
          boxShadow={selected ? "outline" : "none"}
          onClick={() => {
            handleSelectClick();
          }}
          sx={{
            "&:hover": {
              ".media-card-select": {
                zIndex: 10,
                transform: "translateX(0)",
              },
              ".media-card-overlay": {
                zIndex: 10,
                transform: "translateY(0)",
              },
            },
          }}
          _hover={
            selected
              ? {}
              : {
                  boxShadow: "lg",
                  ring: "2",
                }
          }
          bg={cardBgColor}
        >
          <CardBody pos={"relative"} p={2} bg={"transparent"}>
            <Box
              pos="absolute"
              top={4}
              right={4}
              zIndex={!selected ? -1 : 10}
              transform={!selected ? "translateX(150%)" : "none"}
              className="media-card-select"
              transition={"all 0.2s"}
            >
              <IconButton
                size="sm"
                aria-label="Select"
                icon={
                  selected ? <LuSquareCheck /> : <LuSquare fontWeight={500} />
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(media);
                }}
              ></IconButton>
            </Box>
            <VStack
              transition={"all 0.2s"}
              zIndex={-1}
              bottom={0}
              right={0}
              position={"absolute"}
              left={0}
              p={3}
              className="media-card-overlay"
              borderTop={"1px solid"}
              borderColor={"gray.600"}
              bg={cardBgColor}
              transform={"translateY(100%)"}
            >
              <Button
                size="sm"
                variant="outline"
                leftIcon={<LuEye />}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewClick(media);
                }}
              >
                Preview
              </Button>
            </VStack>
            {media.type === "image" && (
              <Box rounded={"md"} aspectRatio={16 / 9}>
                <Image
                  src={media.thumbnail || media.url}
                  alt={media.alt_text || media.name}
                  w="full"
                  h="full"
                  objectFit={"contain"}
                />
              </Box>
            )}
            {media.type === "video" && (
              <Box rounded={"md"} position="relative" aspectRatio={16 / 9}>
                <Box
                  as="video"
                  controls
                  src={media.thumbnail || media.url}
                  w="full"
                  h="full"
                  objectFit={"contain"}
                />
              </Box>
            )}
            {media.type !== "video" && media.type !== "image" && (
              <Flex
                rounded={"md"}
                bg={flexBgColor}
                align={"center"}
                justify={"center"}
                h={200}
              >
                {getIcon()}
              </Flex>
            )}
          </CardBody>
          <CardFooter p={2} fontSize={"small"}>
            <Box isTruncated w={"full"}>
              <Text isTruncated fontWeight={"medium"}>
                {media.name}
              </Text>
              <Text
                fontSize={"x-small"}
                color={useColorModeValue("gray.500", "gray.400")}
              >
                {formatBytes(media.size)}
              </Text>
            </Box>
          </CardFooter>
        </Card>
      </>
    );
  }
);

MediaCard.displayName = "MediaCard";
