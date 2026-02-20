"use client";

import {
  Box,
  Button,
  Field,
  Input,
  Textarea,
  VStack,
  HStack,
  Image,
  Text,
  IconButton,
  Progress,
  Alert,
  Badge,
  Collapsible,
} from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  LuLink,
  LuLoaderCircle,
  LuUpload,
  LuX,
  LuCircleCheck,
  LuCircleAlert,
} from "react-icons/lu";
import { MediaResponse } from "@/types";
import axios from "axios";

import { useQueryClient } from "@tanstack/react-query";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";

interface FileUploadProps {
  folder?: string;
  onUploadComplete?: (media: MediaResponse) => void;
  maxSize?: number;
  acceptedFileTypes?: Record<string, string[]>;
}

type UploadStatus = "pending" | "uploading" | "success" | "error";

interface FileWithStatus {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  previewUrl: string;
  alt_text?: string;
  caption?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  folder = "uploads",
  onUploadComplete,
  maxSize = 10485760,
  acceptedFileTypes = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "video/mp4": [".mp4"],
    "video/webm": [".webm"],
    "audio/mpeg": [".mp3"],
    "audio/wav": [".wav"],
    "application/pdf": [".pdf"],
  },
}) => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const [filesWithStatus, setFilesWithStatus] = useState<FileWithStatus[]>([]);
  const [expandedFileIndex, setExpandedFileIndex] = useState<number | null>(
    null
  );

  const borderColor = useColorModeValue("gray.300", "gray.600");
  const activeBorderColor = useColorModeValue("brand.500", "brand.400");
  const activeBgColor = useColorModeValue("brand.50", "brand.900");
  const iconColor = useColorModeValue("gray.400", "gray.500");
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const itemBgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const mutedTextColor = useColorModeValue("gray.500", "gray.400");

  const getSignature = async () => {
    const response = await fetch(`/api/upload/signature?folder=${folder}`);
    return response.json();
  };

  const uploadToCloudinary = async (
    file: File,
    signatureData: any,
    onProgress: (progress: number) => void
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", signatureData.timestamp.toString());
    formData.append("signature", signatureData.signature);
    formData.append("folder", folder);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          onProgress(progress);
        },
      }
    );

    return response.data;
  };

  const saveToDatabase = async (
    cloudinaryData: any,
    alt_text?: string,
    caption?: string
  ) => {
    const response = await axios.post("/api/upload", {
      ...cloudinaryData,
      alt_text,
      caption,
    });
    return response.data;
  };

  const handleRemoveFile = (index: number) => {
    setFilesWithStatus((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    if (expandedFileIndex === index) {
      setExpandedFileIndex(null);
    }
  };

  const updateFileStatus = (
    index: number,
    updates: Partial<FileWithStatus>
  ) => {
    setFilesWithStatus((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const updateFileMetadata = (
    index: number,
    field: "alt_text" | "caption",
    value: string
  ) => {
    setFilesWithStatus((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleUpload = async () => {
    if (filesWithStatus.length === 0) return;

    setUploading(true);

    const uploadPromises = filesWithStatus.map(
      async (fileWithStatus, index) => {
        if (fileWithStatus.status !== "pending") return;

        try {
          updateFileStatus(index, { status: "uploading", progress: 0 });

          const signatureData = await getSignature();

          const cloudinaryData = await uploadToCloudinary(
            fileWithStatus.file,
            signatureData,
            (progress) => {
              updateFileStatus(index, { progress });
            }
          );

          const savedMedia = await saveToDatabase(
            cloudinaryData,
            fileWithStatus.alt_text,
            fileWithStatus.caption
          );

          updateFileStatus(index, { status: "success", progress: 100 });
          onUploadComplete?.(savedMedia);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Upload failed";
          updateFileStatus(index, {
            status: "error",
            error: errorMessage,
          });
          console.error("Upload error:", err);
        }
      }
    );

    await Promise.allSettled(uploadPromises);

    const successCount = filesWithStatus.filter(
      (f) => f.status === "success"
    ).length;
    const errorCount = filesWithStatus.filter(
      (f) => f.status === "error"
    ).length;

    if (successCount > 0) {
      toaster.create({
        title: `${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully`,
      });
      queryClient.invalidateQueries({
        queryKey: ["media"],
        refetchType: "all",
        exact: false,
      });
    }

    if (errorCount > 0) {
      toaster.create({
        title: `${errorCount} file${errorCount > 1 ? "s" : ""} failed to upload`,
        type: "error",
      });
    }

    setUploading(false);

    // Clean up successful uploads
    setFilesWithStatus((prev) => {
      const remaining = prev.filter((f) => f.status !== "success");
      prev
        .filter((f) => f.status === "success")
        .forEach((f) => {
          URL.revokeObjectURL(f.previewUrl);
        });
      return remaining;
    });
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      const newFiles: FileWithStatus[] = acceptedFiles.map((file) => ({
        file,
        status: "pending" as UploadStatus,
        progress: 0,
        previewUrl: URL.createObjectURL(file),
        alt_text: "",
        caption: "",
      }));

      setFilesWithStatus((prev) => [...prev, ...newFiles]);

      if (rejectedFiles.length > 0) {
        toaster.create({
          title: `${rejectedFiles.length} file${rejectedFiles.length > 1 ? "s" : ""} rejected`,
          description: "Files may be too large or have invalid formats",
          type: "warning",
        });
      }
    },
    [toaster]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedFileTypes,
    disabled: uploading,
  });

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case "success":
        return <Box as={LuCircleCheck} color="green.500" />;
      case "error":
        return <Box as={LuCircleAlert} color="red.500" />;
      case "uploading":
        return (
          <Box as={LuLoaderCircle} color="brand.500" className="animate-spin" />
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: UploadStatus) => {
    const colorScheme = {
      pending: "gray",
      uploading: "blue",
      success: "green",
      error: "red",
    }[status];

    return (
      <Badge colorPalette={colorScheme} fontSize="xs">
        {status}
      </Badge>
    );
  };

  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <Box mx="auto" h="full" w="full">
      <VStack gap={6} w="full">
        <VStack
          minH="300px"
          justify="center"
          w="full"
          {...getRootProps()}
          borderWidth="2px"
          borderStyle="dashed"
          borderColor={isDragActive ? activeBorderColor : borderColor}
          borderRadius="xl"
          p={8}
          cursor="pointer"
          transition="all 0.3s ease"
          bg={isDragActive ? activeBgColor : "transparent"}
          opacity={uploading ? 0.6 : 1}
          pointerEvents={uploading ? "none" : "auto"}
          _hover={{
            borderColor: activeBorderColor,
            bg: activeBgColor,
          }}
        >
          <input {...getInputProps()} />
          <VStack gap={3}>
            {uploading ? (
              <VStack gap={3}>
                <Box
                  as={LuLoaderCircle}
                  h={12}
                  w={12}
                  color="brand.500"
                  className="animate-spin"
                />
                <Text fontSize="lg" fontWeight="medium" color={textColor}>
                  Uploading files...
                </Text>
              </VStack>
            ) : (
              <>
                <Box as={LuUpload} h={12} w={12} color={iconColor} />
                <VStack gap={1}>
                  <Text fontSize="lg" fontWeight="medium" color={textColor}>
                    {isDragActive
                      ? "Drop files here"
                      : "Drag & drop files here"}
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    or click to browse
                  </Text>
                </VStack>
                <Text fontSize="xs" color={mutedTextColor} mt={2}>
                  Maximum file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
                </Text>
              </>
            )}
          </VStack>
        </VStack>

        {filesWithStatus.length > 0 && (
          <VStack
            gap={3}
            w="full"
            bg={bgColor}
            p={4}
            borderRadius="xl"
            maxW="900px"
          >
            <HStack w="full" justify="space-between" mb={2}>
              <Text fontWeight="semibold" color={textColor}>
                {filesWithStatus.length} file
                {filesWithStatus.length > 1 ? "s" : ""} ready
              </Text>
              <Button
                onClick={handleUpload}
                loading={uploading}
                loadingText="Uploading..."
                colorPalette="brand"
                size="sm"
                disabled={filesWithStatus.every((f) => f.status !== "pending")}
              >
                Upload All
              </Button>
            </HStack>

            {filesWithStatus.map((fileItem, index) => (
              <VStack
                key={index}
                w="full"
                gap={2}
                p={3}
                bg={itemBgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <HStack w="full" gap={3}>
                  <Box
                    boxSize="60px"
                    borderRadius="md"
                    overflow="hidden"
                    bg="gray.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    {fileItem.previewUrl ? (
                      <Image
                        src={fileItem.previewUrl}
                        alt={`Preview ${index + 1}`}
                        objectFit="cover"
                        boxSize="60px"
                        borderRadius="md"
                      />
                    ) : (
                      <Text fontSize="xs" color="gray.500">
                        No preview
                      </Text>
                    )}
                  </Box>
                  <VStack flex={1} align="start" gap={1}>
                    <HStack w="full">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        truncate
                        flex={1}
                        color={textColor}
                      >
                        {fileItem.file.name}
                      </Text>
                      {getStatusBadge(fileItem.status)}
                    </HStack>
                    <HStack gap={2} fontSize="xs" color={mutedTextColor}>
                      <Text>{(fileItem.file.size / 1024).toFixed(2)} KB</Text>
                      {fileItem.status === "uploading" && (
                        <Text color="brand.500" fontWeight="medium">
                          {fileItem.progress}%
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                  <HStack gap={2}>
                    {getStatusIcon(fileItem.status)}
                    {fileItem.status === "pending" && (
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                          setExpandedFileIndex(
                            expandedFileIndex === index ? null : index
                          )
                        }
                      >
                        {expandedFileIndex === index ? "Hide" : "Edit"}
                      </Button>
                    )}
                    <IconButton
                      aria-label="remove file"
                      colorPalette="red"
                      variant="ghost"
                      size="sm"
                      disabled={uploading && fileItem.status === "uploading"}
                      onClick={() => handleRemoveFile(index)}
                    >
                      <LuX />
                    </IconButton>
                  </HStack>
                </HStack>

                <Collapsible.Root open={expandedFileIndex === index}>
                  <VStack gap={3} w="full" pt={2}>
                    {isImage(fileItem.file) && (
                      <Field.Root>
                        <Field.Label fontSize="xs" mb={1}>
                          Alt Text
                        </Field.Label>
                        <Input
                          size="sm"
                          placeholder="Describe this image for accessibility"
                          value={fileItem.alt_text}
                          onChange={(e) =>
                            updateFileMetadata(
                              index,
                              "alt_text",
                              e.target.value
                            )
                          }
                        />
                      </Field.Root>
                    )}
                    <Field.Root>
                      <Field.Label fontSize="xs" mb={1}>
                        Caption
                      </Field.Label>
                      <Textarea
                        fontSize="sm"
                        placeholder="Add a caption (optional)"
                        rows={2}
                        value={fileItem.caption}
                        onChange={(e) =>
                          updateFileMetadata(index, "caption", e.target.value)
                        }
                      />
                    </Field.Root>
                  </VStack>
                </Collapsible.Root>

                {fileItem.status === "uploading" && (
                  <Progress.Root
                    value={fileItem.progress}
                    size="xs"
                    w="full"
                    colorPalette="brand"
                    borderRadius="full"
                  />
                )}

                {fileItem.status === "error" && fileItem.error && (
                  <Alert.Root status="error" borderRadius="md" fontSize="sm">
                    <Alert.Indicator />
                    <Alert.Description>{fileItem.error}</Alert.Description>
                  </Alert.Root>
                )}
              </VStack>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

interface UrlUploadProps {
  folder?: string;
  onUploadComplete?: (media: MediaResponse) => void;
}

export const FileUrlUpload: React.FC<UrlUploadProps> = ({
  folder = "uploads",
  onUploadComplete,
}) => {
  const [url, setUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [alt_text, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setUploading(true);
    setError(null);

    try {
      const { data, status } = await axios.post("/api/upload/url", {
        url,
        folder,
        filename: filename || undefined,
        alt_text: alt_text || undefined,
        caption: caption || undefined,
      });

      if (status !== 200) throw new Error("Upload failed");

      const result = data;
      onUploadComplete?.(result);
      setUrl("");
      setFilename("");
      setAltText("");
      setCaption("");
      queryClient.invalidateQueries({
        queryKey: ["media"],
        refetchType: "all",
        exact: false,
      });
      toaster.create({ title: "Uploaded successfully" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload from URL";
      setError(errorMessage);
      toaster.create({
        title: "Upload failed",
        description: errorMessage,
        type: "error",
      });
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      w="full"
      maxW="xl"
      mx="auto"
      p={6}
      bg={bgColor}
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <form onSubmit={handleSubmit}>
        <VStack gap={5}>
          <Field.Root required>
            <Field.Label htmlFor="url" fontSize="sm" fontWeight="medium">
              Image URL
            </Field.Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={uploading}
              required
              size="lg"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="sm" htmlFor="filename" fontWeight="medium">
              Custom Filename (optional)
            </Field.Label>
            <Input
              id="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="custom-filename"
              disabled={uploading}
              size="lg"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="sm" htmlFor="alt_text" fontWeight="medium">
              Alt Text (optional)
            </Field.Label>
            <Input
              id="alt_text"
              type="text"
              value={alt_text}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
              disabled={uploading}
              size="lg"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="sm" htmlFor="caption" fontWeight="medium">
              Caption (optional)
            </Field.Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption"
              disabled={uploading}
              size="lg"
              rows={3}
            />
          </Field.Root>

          {error && (
            <Alert.Root status="error" borderRadius="md">
              <Alert.Indicator />
              <Alert.Description fontSize="sm">{error}</Alert.Description>
            </Alert.Root>
          )}

          <Button
            type="submit"
            disabled={uploading || !url}
            w="full"
            size="lg"
            colorPalette="brand"
          >
            uploading ? (
            <LuLoaderCircle className="animate-spin" />
            ) : (
            <LuLink />){uploading ? "Uploading..." : "Upload from URL"}
          </Button>
        </VStack>
      </form>
    </Box>
  );
};
