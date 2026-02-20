import { HStack, Tag, Box, Input, Button, List, Spinner, Text, InputAddon, Group, Skeleton } from "@chakra-ui/react";

import { SectionCard } from "../../../Dashboard/SectionCard";
import { memo, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { generateSlug } from "@/utils";
import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import { debounce } from "lodash";

export const TagsSection = memo(() => {
  const [tagToRemoveId, setTagToRemoveId] = useState<null | number>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const queryClient = useQueryClient();
  const postId = useEditorPostManagerStore(
    (state) => state.activePost?.post_id
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearchQuery = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 1000),
    []
  );

  const { data: postTags } = useQuery({
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryKey: ["postTags", postId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/posts/${postId}/tags`);
      return (data?.data || []) as { id: number; name: string; slug: string }[];
    },
  });

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["tagSearch", searchQuery],
    queryFn: async () => {
      const { data } = await axios.get(`/api/tags/search?q=${searchQuery}`);
      return data?.data;
    },
    enabled: searchQuery.length > 0,
  });

  const createTagMutation = useMutation({
    mutationFn: async (tagName: string) => {
      const { data } = await axios.post("/api/tags", {
        name: tagName,
        slug: generateSlug(tagName),
      });
      await addTagToPostMutation.mutateAsync(data?.data?.id);
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tagSearch", postId],
        exact: true,
      });
      setSearchInputValue("");
      setShowDropdown(false);
    },
  });

  const addTagToPostMutation = useMutation({
    mutationFn: async (tagId: number) => {
      await axios.post(`/api/posts/${postId}/tags`, {
        tagIds: [tagId],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["postTags", postId],
        exact: true,
      });
      setSearchInputValue("");
      setShowDropdown(false);
    },
  });

  const removeTagFromPostMutation = useMutation({
    mutationFn: async (tagId: number) => {
      try {
        setIsRemoving(true);
        await axios.patch(`/api/posts/${postId}/tags`, {
          tagIds: [tagId],
        });
      } finally {
        setIsRemoving(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["postTags", postId],
        exact: true,
      });
    },
  });
  function handleTagRemove(tagId: number) {
    setTagToRemoveId(tagId);
    removeTagFromPostMutation.mutate(tagId);
  }
  useEffect(() => {
    debouncedSearchQuery(searchInputValue);
  }, [debouncedSearchQuery, searchInputValue]);
  return (
    <SectionCard title="Tags">
      <HStack p={4} pb={0} gap={2} wrap={"wrap"}>
        <AnimatePresence>
          {postTags &&
            postTags?.length > 0 &&
            postTags?.map((tag) => (
              <motion.div
                key={tag.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Tag.Root
                  rounded={"full"}
                  variant="solid"
                  opacity={isRemoving && tagToRemoveId === tag.id ? 0.5 : 1}
                >
                  <Tag.Label>#{tag.name}</Tag.Label>
                  {removeTagFromPostMutation.isPending &&
                  tagToRemoveId === tag.id ? (
                    <Tag.EndElement as={Spinner} />
                  ) : (
                    <Tag.CloseTrigger onClick={() => handleTagRemove(tag.id)} />
                  )}
                </Tag.Root>
              </motion.div>
            ))}
        </AnimatePresence>
      </HStack>

      <Box p={4} position="relative">
        <Group size={"sm"}>
          <Input
            placeholder="Search or create tag"
            size={"sm"}
            value={searchInputValue}
            rounded={"full"}
            onChange={(e) => {
              setSearchInputValue(e.target.value);
              setShowDropdown(true);
            }}
          />
          {searchQuery && (
            <InputAddon placement="end" roundedRight={"full"}>
              {isSearching && <Spinner size="sm" />}
              {!isSearching && !searchResults?.length && (
                <Button
                  rounded={"full"}
                  onClick={() => createTagMutation.mutate(searchQuery)}
                  size={"xs"}
                  variant={"outline"}
                  fontWeight={500}
                  fontSize={"13px"}
                  loading={createTagMutation.isPending}
                >
                  Create Tag
                </Button>
              )}
            </InputAddon>
          )}
        </Group>

        {showDropdown && searchQuery && (
          <List.Root
            position="absolute"
            top="100%"
            left={0}
            right={0}
            bg="white"
            boxShadow="md"
            borderRadius="md"
            mt={2}
            maxH="200px"
            overflowY="auto"
            zIndex={1}
          >
            {isSearching ? (
              <List.Item p={2}>
                <Skeleton height="15px" mb={1} width="190px" rounded={"xl"} />
                <Skeleton height="15px" width="140px" rounded={"xl"} />
              </List.Item>
            ) : searchResults?.length ? (
              searchResults.map((tag: { id: number; name: string }) => (
                <List.Item
                  key={tag.id}
                  p={2}
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => addTagToPostMutation.mutate(tag.id)}
                >
                  #{tag.name}
                </List.Item>
              ))
            ) : (
              <List.Item p={2}>
                <Text fontSize="sm">No tags found</Text>
              </List.Item>
            )}
          </List.Root>
        )}
      </Box>
    </SectionCard>
  );
});
TagsSection.displayName = "TagsSection";
