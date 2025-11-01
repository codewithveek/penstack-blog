import React, { memo } from "react";
import { LuFile, LuImage, LuVideo, LuFileText, LuMusic } from "react-icons/lu";
import {
  Card,
  CardBody,
  CardHeader,
  Badge,
  Heading,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Image,
  DrawerCloseButton,
  Text,
} from "@chakra-ui/react";
import { MediaResponse } from "@/types";
import { formatBytes } from "@/utils";

const FilePreview = memo(
  ({
    file,
    isOpen,
    onClose,
  }: {
    file: MediaResponse;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    const formatDate = (date: string | Date) => {
      return date ? new Date(date).toLocaleString() : "--";
    };

    const getFileIcon = (type: MediaResponse["type"]) => {
      switch (type) {
        case "image":
          return <LuImage className="w-6 h-6 text-blue-500" />;
        case "video":
          return <LuVideo className="w-6 h-6 text-red-500" />;
        case "pdf":
          return <LuFileText className="w-6 h-6 text-orange-500" />;
        case "audio":
          return <LuMusic className="w-6 h-6 text-purple-500" />;
        default:
          return <LuFile className="w-6 h-6 text-gray-500" />;
      }
    };

    const renderPreview = () => {
      switch (file.type) {
        case "image":
          return (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={file.url}
                alt={file.alt_text || file.name}
                className="object-contain w-full h-full"
              />
            </div>
          );
        case "video":
          return (
            <video
              className="w-full rounded-lg max-h-96"
              controls
              preload="metadata"
              src={file.url}
            >
              {/* <source src={file.url} type={file.mime_type || ""} /> */}
              Your browser does not support the video tag.
            </video>
          );
        case "pdf":
          return (
            <object
              data={file.url}
              type="application/pdf"
              className="w-full h-96 rounded-lg border-2 border-gray-200"
              aria-labelledby="PDF document"
              title={file.name}
            >
              <Text textAlign={"center"} my={8}>
                Cloudinary restricts PDFs on free accounts.
              </Text>
            </object>
          );
        default:
          return (
            <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
              {getFileIcon(file.type)}
            </div>
          );
      }
    };

    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "full", md: "lg" }}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <DrawerCloseButton />
          </DrawerHeader>

          <DrawerBody>
            {file && (
              <Card className="w-full max-w-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.type)}
                    <Heading size="md" fontWeight={"medium"}>
                      {file.name}
                    </Heading>
                  </div>
                  <Badge variant="secondary">{file.type.toUpperCase()}</Badge>
                </CardHeader>
                <CardBody className="space-y-4">
                  {renderPreview()}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Size</p>
                      <p className="font-medium">{formatBytes(file.size)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Type</p>
                      <p className="font-medium">{file.mime_type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Dimensions</p>
                      <p className="font-medium">
                        {file.width} × {file.height}
                      </p>
                    </div>
                    {file.type === "image" && (
                      <>
                        <div>
                          <p className="text-gray-500">Alt Text</p>
                          <p className="font-medium">
                            {file.alt_text || "None"}
                          </p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-medium">
                        {formatDate(file.created_at as Date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Last Modified</p>
                      <p className="font-medium">
                        {formatDate(file.updated_at as Date)}
                      </p>
                    </div>
                  </div>

                  {file.caption && (
                    <div>
                      <p className="text-gray-500">Caption</p>
                      <p className="mt-1">{file.caption}</p>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-500">URL</p>
                    <p className="font-medium">{file.url}</p>
                  </div>
                </CardBody>
              </Card>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }
);

FilePreview.displayName = "FilePreview";

export default FilePreview;
