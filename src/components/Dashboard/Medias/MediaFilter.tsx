import { Button, HStack, Input, Group, InputAddon, NativeSelect } from "@chakra-ui/react";
import React, { memo } from "react";
import { LuRefreshCw, LuSearch } from "react-icons/lu";

import { FilterParams, MediaType } from "@/types";

interface MediaFilterProps {
  onFilterChange: (filters: Partial<FilterParams>) => void;
  refetchMedia: () => void;
}

export const MediaFilter: React.FC<MediaFilterProps> = memo(
  ({ onFilterChange, refetchMedia }) => {
    return (
      <HStack
        py={4}
        gap={4}
        wrap={{ base: "wrap", xl: "nowrap" }}
        justify="space-between"
      >
        <Group maxW={500}>
          <InputAddon placement="start" roundedLeft="md">
            <LuSearch />
          </InputAddon>
          <Input
            roundedRight="md"
            placeholder="Search media..."
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </Group>

        <HStack gap={4} wrap={{ base: "wrap", md: "nowrap" }}>
          <NativeSelect.Root
            rounded="md"
            onChange={(e) =>
              onFilterChange({
                type: e.target.value as MediaType,
              })
            }
          >
            <option value="">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="pdf">PDF</option>
            <option value="doc">Documents</option>
          </NativeSelect.Root>

          <NativeSelect.Root
            rounded="md"
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;
              onFilterChange({
                sortBy: value.split("-")[0] as "created_at" | "name" | "size",
                sortOrder: value.split("-")[1] as "asc" | "desc",
              });
            }}
          >
            <option value="">Sort by</option>
            <option value="created_at-desc">Newest first</option>
            <option value="created_at-asc">Oldest first</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest first</option>
            <option value="size-asc">Smallest first</option>
          </NativeSelect.Root>

          <Button
            flexShrink={0}
            ml="auto"
            size="sm"
            rounded="md"
            onClick={refetchMedia}
          ><LuRefreshCw /> Refresh</Button>
        </HStack>
      </HStack>
    );
  }
);

MediaFilter.displayName = "MediaFilter";
