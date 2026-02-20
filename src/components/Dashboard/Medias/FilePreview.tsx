import {
  Card,
  Badge,
  Heading,
  Drawer,
  Image,
  Text,
  VStack,
  HStack,
  Box,
} from "@chakra-ui/react";
import React, { memo } from "react";
import { LuFile, LuImage, LuVideo, LuFileText, LuMusic } from "react-icons/lu";

import { MediaResponse } from "@/types";
import { formatBytes } from "@/utils";
import { useColorModeValue } from "@/components/ui/color-mode";

const FilePreview = memo(
  ({
    file,
    open,
    onOpenChange,
  }: {
    file: MediaResponse;
    open: boolean;
    onOpenChange: () => void;
  }) => {
    const bgColor = useColorModeValue("gray.50", "gray.700");
    const labelColor = useColorModeValue("gray.600", "gray.400");

    if (!file) return null;

    const formatDate = (date: string | Date) => {
      return date ? new Date(date).toLocaleString() : "--";
    };

    const getFileIcon = (type: MediaResponse["type"]) => {
      const iconProps = { boxSize: 6 };
      switch (type) {
        case "image":
          return <LuImage {...iconProps} color="blue.500" />;
        case "video":
          return <LuVideo {...iconProps} color="red.500" />;
        case "pdf":
          return <LuFileText {...iconProps} color="orange.500" />;
        case "audio":
          return <LuMusic {...iconProps} color="purple.500" />;
        default:
          return <LuFile {...iconProps} color="gray.500" />;
      }
    };

    const renderPreview = () => {
      switch (file.type) {
        case "image":
          return (
            <Box
              position="relative"
              aspectRatio={16 / 9}
              rounded="lg"
              overflow="hidden"
              bg={bgColor}
            >
              <Image
                src={file.url}
                alt={file.alt_text || file.name}
                objectFit="contain"
                w="full"
                h="full"
              />
            </Box>
          );
        case "video":
          return (
            <video
              style={{
                width: "100%",
                borderRadius: "0.5rem",
                maxHeight: "24rem",
              }}
              controls
              preload="metadata"
              src={file.url}
            >
              Your browser does not support the video tag.
            </video>
          );
        case "pdf":
          return (
            <object
              data={file.url}
              type="application/pdf"
              style={{
                width: "100%",
                height: "24rem",
                borderRadius: "0.5rem",
                borderWidth: "2px",
                borderColor: "#E2E8F0",
              }}
              aria-label="PDF document"
              title={file.name}
            >
              <Text textAlign="center" my={8}>
                Cloudinary restricts PDFs on free accounts.
              </Text>
            </object>
          );
        default:
          return (
            <VStack h="48" bg={bgColor} rounded="lg" justify="center">
              {getFileIcon(file.type)}
            </VStack>
          );
      }
    };

    return (
      <Drawer.Root
        open={open}
        onOpenChange={onOpenChange}
        size={{ base: "full", md: "lg" }}
      >
        <Drawer.Backdrop />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.CloseTrigger />
          </Drawer.Header>

          <Drawer.Body>
            <Card.Root w="full" maxW="2xl">
              <Card.Header>
                <HStack justify="space-between">
                  <HStack gap={2}>
                    {getFileIcon(file.type)}
                    <Heading size="md" fontWeight="medium">
                      {file.name}
                    </Heading>
                  </HStack>
                  <Badge variant="outline">{file.type.toUpperCase()}</Badge>
                </HStack>
              </Card.Header>

              <Card.Body>
                <VStack gap={4} align="stretch">
                  {renderPreview()}

                  <Box
                    display="grid"
                    gridTemplateColumns="repeat(2, 1fr)"
                    gap={4}
                    fontSize="sm"
                  >
                    <Box>
                      <Text color={labelColor}>Size</Text>
                      <Text fontWeight="medium">{formatBytes(file.size)}</Text>
                    </Box>
                    <Box>
                      <Text color={labelColor}>Type</Text>
                      <Text fontWeight="medium">{file.mime_type}</Text>
                    </Box>
                    <Box>
                      <Text color={labelColor}>Dimensions</Text>
                      <Text fontWeight="medium">
                        {file.width} × {file.height}
                      </Text>
                    </Box>
                    {file.type === "image" && (
                      <Box>
                        <Text color={labelColor}>Alt Text</Text>
                        <Text fontWeight="medium">
                          {file.alt_text || "None"}
                        </Text>
                      </Box>
                    )}
                    <Box>
                      <Text color={labelColor}>Created</Text>
                      <Text fontWeight="medium">
                        {formatDate(file.created_at as Date)}
                      </Text>
                    </Box>
                    <Box>
                      <Text color={labelColor}>Last Modified</Text>
                      <Text fontWeight="medium">
                        {formatDate(file.updated_at as Date)}
                      </Text>
                    </Box>
                  </Box>

                  {file.caption && (
                    <Box>
                      <Text color={labelColor}>Caption</Text>
                      <Text mt={1}>{file.caption}</Text>
                    </Box>
                  )}

                  <Box>
                    <Text color={labelColor} mb={2}>
                      URL
                    </Text>
                    <Text
                      fontWeight="medium"
                      fontSize="xs"
                      wordBreak="break-all"
                    >
                      {file.url}
                    </Text>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    );
  }
);

FilePreview.displayName = "FilePreview";

export default FilePreview;
