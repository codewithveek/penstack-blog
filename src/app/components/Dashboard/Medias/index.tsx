"use client";
import {
  AbsoluteCenter,
  Box,
  Divider,
  Stack,
  Tab,
  TabIndicator,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FileUpload, FileUrlUpload } from "../../FileUpload";
import { MediaLibrary } from "./MediaLibrary";
import { FilterParams, MediaResponse } from "@/types";

interface MediasComponentProps {
  multiple?: boolean;
  maxSelection?: number;
  defaultFilters?: Partial<FilterParams>;
  onSelect?: (media: MediaResponse | MediaResponse[]) => void;
}
export default function Medias({
  multiple = true,
  onSelect,
  maxSelection,
  defaultFilters = {},
}: MediasComponentProps) {
  const dividerBgColor = useColorModeValue("white", "gray.900");
  return (
    <Box py={6} px={{ base: 0, md: 5 }} bg={dividerBgColor} rounded={"lg"}>
      <Tabs h={"full"}>
        <TabList>
          <Tab>Media Library</Tab>
          <Tab>Upload Media</Tab>
          <Tab>Upload from URL</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MediaLibrary
              multiple={multiple}
              defaultFilters={defaultFilters}
              maxSelection={maxSelection}
              onSelect={(selectedMedia) => {
                onSelect?.(selectedMedia);
              }}
            />
          </TabPanel>
          <TabPanel>
            <Stack gap={4}>
              <FileUpload />
            </Stack>
          </TabPanel>
          <TabPanel>
            <Box py={4}>
              <FileUrlUpload />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
