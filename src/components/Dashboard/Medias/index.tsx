"use client";

import { Box, Stack, Tabs } from "@chakra-ui/react";

import { FileUpload, FileUrlUpload } from "@/components/FileUpload";
import { MediaLibrary } from "@/components/Dashboard/Medias/MediaLibrary";
import { FilterParams, MediaResponse } from "@/types";
import { useColorModeValue } from "@/components/ui/color-mode";

interface MediasComponentProps {
  multiple?: boolean;
  maxSelection?: number;
  defaultFilters?: Partial<FilterParams>;
  onSelect?: (media: MediaResponse | MediaResponse[]) => void;
  canSelect?: boolean;
}
export default function Medias({
  multiple = true,
  onSelect,
  maxSelection,
  defaultFilters = {},
  canSelect = true,
}: MediasComponentProps) {
  const dividerBgColor = useColorModeValue("white", "gray.900");
  return (
    <Box py={6} px={{ base: 0, md: 5 }} bg={dividerBgColor} rounded={"lg"}>
      <Tabs.Root h={"full"} defaultValue="library">
        <Tabs.List>
          <Tabs.Trigger value="library">Media Library</Tabs.Trigger>
          <Tabs.Trigger value="upload">Upload Media</Tabs.Trigger>
          <Tabs.Trigger value="url">Upload from URL</Tabs.Trigger>
        </Tabs.List>
        <Tabs.ContentGroup>
          <Tabs.Content value="library">
            <MediaLibrary
              multiple={multiple}
              defaultFilters={defaultFilters}
              maxSelection={maxSelection}
              onSelect={(selectedMedia) => {
                onSelect?.(selectedMedia);
              }}
              canSelect={canSelect}
            />
          </Tabs.Content>
          <Tabs.Content value="upload">
            <Stack gap={4}>
              <FileUpload />
            </Stack>
          </Tabs.Content>
          <Tabs.Content value="url">
            <Box py={4}>
              <FileUrlUpload />
            </Box>
          </Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>
    </Box>
  );
}
