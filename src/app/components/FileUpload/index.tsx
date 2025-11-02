"use client";
import React, { useCallback, useState, useRef } from "react";
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
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast,
  VStack,
  HStack,
  Image,
  Text,
  IconButton,
  Progress,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  Badge,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";

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
  const toast = useToast({
    position: "top",
    status: "success",
    duration: 3000,
    isClosable: true,
  });

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

  const saveToDatabase = async (cloudinaryData: any) => {
    const response = await axios.post("/api/upload", cloudinaryData);
    return response.data;
  };

  const handleRemoveFile = (index: number) => {
    setFilesWithStatus((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateFileStatus = (
    index: number,
    updates: Partial<FileWithStatus>
  ) => {
    setFilesWithStatus((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
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

          const savedMedia = await saveToDatabase(cloudinaryData);

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

    // Check results
    const results = filesWithStatus.map((f, i) => filesWithStatus[i]);
    const successCount = results.filter((f) => f.status === "success").length;
    const errorCount = results.filter((f) => f.status === "error").length;

    if (successCount > 0) {
      toast({
        title: `${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully`,
      });
      queryClient.invalidateQueries({
        queryKey: ["media"],
        refetchType: "all",
        exact: false,
      });
    }

    if (errorCount > 0) {
      toast({
        title: `${errorCount} file${errorCount > 1 ? "s" : ""} failed to upload`,
        status: "error",
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
      }));

      setFilesWithStatus((prev) => [...prev, ...newFiles]);

      if (rejectedFiles.length > 0) {
        toast({
          title: `${rejectedFiles.length} file${rejectedFiles.length > 1 ? "s" : ""} rejected`,
          description: "Files may be too large or have invalid formats",
          status: "warning",
        });
      }
    },
    [toast]
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
      <Badge colorScheme={colorScheme} fontSize="xs">
        {status}
      </Badge>
    );
  };

  return (
    <Box mx="auto" h="full" w="full">
      <VStack spacing={6} w="full">
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
          <VStack spacing={3}>
            {uploading ? (
              <VStack spacing={3}>
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
                <VStack spacing={1}>
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
            spacing={3}
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
                isLoading={uploading}
                loadingText="Uploading..."
                colorScheme="brand"
                size="sm"
                isDisabled={filesWithStatus.every(
                  (f) => f.status !== "pending"
                )}
              >
                Upload All
              </Button>
            </HStack>

            {filesWithStatus.map((fileItem, index) => (
              <VStack
                key={index}
                w="full"
                spacing={2}
                p={3}
                bg={itemBgColor}
                borderRadius="lg"
                boxShadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <HStack w="full" spacing={3}>
                  <Image
                    src={fileItem.previewUrl}
                    alt={`Preview ${index + 1}`}
                    objectFit="cover"
                    boxSize="60px"
                    borderRadius="md"
                    fallback={
                      <Box
                        boxSize="60px"
                        bg="gray.200"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="xs" color="gray.500">
                          No preview
                        </Text>
                      </Box>
                    }
                  />
                  <VStack flex={1} align="start" spacing={1}>
                    <HStack w="full">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        isTruncated
                        flex={1}
                        color={textColor}
                      >
                        {fileItem.file.name}
                      </Text>
                      {getStatusBadge(fileItem.status)}
                    </HStack>
                    <HStack spacing={2} fontSize="xs" color={mutedTextColor}>
                      <Text>{(fileItem.file.size / 1024).toFixed(2)} KB</Text>
                      {fileItem.status === "uploading" && (
                        <Text color="brand.500" fontWeight="medium">
                          {fileItem.progress}%
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                  <HStack spacing={2}>
                    {getStatusIcon(fileItem.status)}
                    <IconButton
                      aria-label="remove file"
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                      isDisabled={uploading && fileItem.status === "uploading"}
                      onClick={() => handleRemoveFile(index)}
                      icon={<LuX />}
                    />
                  </HStack>
                </HStack>

                {fileItem.status === "uploading" && (
                  <Progress
                    value={fileItem.progress}
                    size="xs"
                    w="full"
                    colorScheme="brand"
                    borderRadius="full"
                  />
                )}

                {fileItem.status === "error" && fileItem.error && (
                  <Alert status="error" borderRadius="md" fontSize="sm">
                    <AlertIcon />
                    <AlertDescription>{fileItem.error}</AlertDescription>
                  </Alert>
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
  const toast = useToast({
    position: "top",
    status: "success",
    duration: 3000,
    isClosable: true,
  });
  const [url, setUrl] = useState("");
  const [filename, setFilename] = useState("");
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
      });

      if (status !== 200) throw new Error("Upload failed");

      const result = data;
      onUploadComplete?.(result);
      setUrl("");
      setFilename("");
      queryClient.invalidateQueries({
        queryKey: ["media"],
        refetchType: "all",
        exact: false,
      });
      toast({ title: "Uploaded successfully" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload from URL";
      setError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        status: "error",
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
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel htmlFor="url" fontSize="sm" fontWeight="medium">
              Image URL
            </FormLabel>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              isDisabled={uploading}
              required
              size="lg"
            />
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" htmlFor="filename" fontWeight="medium">
              Custom Filename (optional)
            </FormLabel>
            <Input
              id="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="custom-filename"
              isDisabled={uploading}
              size="lg"
            />
          </FormControl>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            isDisabled={uploading || !url}
            w="full"
            size="lg"
            colorScheme="brand"
            leftIcon={
              uploading ? (
                <LuLoaderCircle className="animate-spin" />
              ) : (
                <LuLink />
              )
            }
          >
            {uploading ? "Uploading..." : "Upload from URL"}
          </Button>
        </VStack>
      </form>
    </Box>
  );
};
