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
      <Tabs.Root h={"full"}>
        <Tabs.List>
          <Tabs.Trigger>Media Library</Tabs.Trigger>
          <Tabs.Trigger>Upload Media</Tabs.Trigger>
          <Tabs.Trigger>Upload from URL</Tabs.Trigger>
        </Tabs.List>
        <Tabs.ContentGroup>
          <Tabs.Content>
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
          <Tabs.Content>
            <Stack gap={4}>
              <FileUpload />
            </Stack>
          </Tabs.Content>
          <Tabs.Content>
            <Box py={4}>
              <FileUrlUpload />
            </Box>
          </Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>
    </Box>
  );
}
