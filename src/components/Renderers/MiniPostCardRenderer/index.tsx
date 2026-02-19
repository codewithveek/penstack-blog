import { SearchPostsComponent } from "@/lib/editor/nodes/MiniPostCard/SearchPostsComponent";
import { PostSelect } from "@/types";
import {
  decodeAndSanitizeHtml,
  generatePostDescription,
  generatePostUrl,
  objectToQueryParams,
  shortenText,
  stripHtml,
} from "@/utils";
import Link from "next/link";
import {
  Box,
  useColorModeValue,
  VStack,
  Text,
  Image,
  Input,
  HStack,
  Stack,
  Button,
  Skeleton,
  StackDivider,
  Card,
  IconButton,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NodeViewProps } from "@tiptap/react";
import axios from "axios";

import { ChangeEvent, memo, useCallback, useState } from "react";
import { FaTrash } from "react-icons/fa";

interface MiniPostCardProps {
  isEditing?: boolean;
  node: Partial<NodeViewProps["node"]>;
  inputValue?: string;
  updateAttributes?: NodeViewProps["updateAttributes"];
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}
export const MiniPostCardRenderer: React.FC<MiniPostCardProps> = memo(
  ({
    node,
    isEditing = false,
    inputValue,
    updateAttributes,
    onInputChange,
  }) => {
    const bgColor = useColorModeValue("gray.50", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.600", "gray.400");
    const [showPostSearch, setShowPostSearch] = useState(false);
    const queryClient = useQueryClient();

    const removePost = useCallback(
      (postId: string) => {
        const postIds = (node?.attrs?.postIds as string)
          ?.split(",")
          .map((id) => id.trim());
        const newPostIds = postIds.filter((id) => id !== postId);
        updateAttributes?.({ postIds: newPostIds.join(",") });
        queryClient.invalidateQueries({
          queryKey: ["post_card_posts"],
          refetchType: "all",
        });
      },
      [node?.attrs?.postIds, updateAttributes]
    );
    const postIds = (node?.attrs?.postIds as string)
      ?.split(",")
      .map((id) => id.trim());
    const {
      data: posts,
      isFetching,
      refetch,
    } = useQuery({
      queryKey: ["post_card_posts"],
      queryFn: async () => {
        const result = await Promise.all(
          postIds.map(async (postId) => {
            const { data } = await axios(`/api/posts/${postId}`);
            return data.data as PostSelect;
          })
        );
        return result;
      },
      enabled: postIds?.length > 0,
      staleTime: Infinity,
    });

    if (!postIds?.length) return null;
    if (isFetching)
      return (
        <Box
          p={4}
          rounded="md"
          bg={bgColor}
          my={4}
          maxW={600}
          border="1px"
          borderColor={borderColor}
        >
          <VStack align="stretch" spacing={3}>
            <Skeleton height="24px" width="200px" />
            {[1, 2].map((i) => (
              <HStack key={i} spacing={4} align="start">
                <Skeleton
                  boxSize={{ base: "80px", lg: "80px" }}
                  rounded={"lg"}
                />
                <Stack align="start" spacing={1} flex={1}>
                  <Skeleton height="24px" width="80%" rounded={"lg"} />
                  <Skeleton height="20px" width="100%" rounded={"lg"} />
                  <Skeleton height="16px" width="90%" rounded={"lg"} />
                </Stack>
              </HStack>
            ))}
          </VStack>
        </Box>
      );
    if (!posts) return null;

    return (
      <Card
        p={3}
        // rounded="md"
        // bg={bgColor}
        my={4}
        maxW={{ base: "100%", lg: 650 }}
        variant={"outline"}
      >
        <VStack align="stretch" spacing={3} divider={<StackDivider />}>
          {!isEditing && node?.attrs?.customTitle && (
            <Text fontSize="medium" className="uppercase font-bold">
              {node.attrs.customTitle}
            </Text>
          )}
          {isEditing && (
            <Input
              border={"none"}
              borderBottom={"1px solid"}
              borderColor={"gray.400"}
              rounded={"none"}
              placeholder="Add custom title (optional)"
              value={inputValue}
              variant={""}
              size={"lg"}
              _focus={{
                border: "2px solid",
                borderColor: "brandPurple.500",
              }}
              fontSize={"large"}
              fontWeight="bold"
              onChange={(e) => {
                onInputChange?.(e);
              }}
            />
          )}
          {posts?.length > 0 &&
            posts.map((post) => (
              <Link
                key={post?.id}
                color={"brandPurple.700"}
                href={generatePostUrl(post)}
                _hover={{ textDecoration: "none", color: "brandPurple.800" }}
                onClick={(e) => {
                  if (isEditing) e.preventDefault();
                }}
              >
                <HStack spacing={4} align="start">
                  {post?.featured_image && (
                    <Image
                      src={post?.featured_image.url}
                      alt={post?.featured_image.alt_text || ""}
                      boxSize={{ base: "80px", lg: "80px" }}
                      maxH={{ base: "80px", lg: "80px" }}
                      objectFit="contain"
                      rounded={"lg"}
                    />
                  )}
                  <Stack align="start" spacing={1}>
                    <HStack>
                      <Text
                        fontSize={{ base: "medium", lg: "large" }}
                        fontWeight="bold"
                      >
                        {post?.title}
                      </Text>
                      {isEditing && (
                        <IconButton
                          icon={<FaTrash />}
                          colorScheme="red"
                          variant="ghost"
                          size={"xs"}
                          aria-label="Remove post"
                          onClick={() => removePost(post?.post_id || "")}
                        />
                      )}
                    </HStack>
                    <Text
                      fontSize={{ base: "14px", lg: "medium" }}
                      color={textColor}
                      noOfLines={2}
                      w={"full"}
                    >
                      {generatePostDescription(post)}
                    </Text>
                  </Stack>
                </HStack>
              </Link>
            ))}
          {isEditing && (
            <>
              {showPostSearch && (
                <SearchPostsComponent
                  onPostSelect={(post) => {
                    updateAttributes?.({
                      postIds: node?.attrs?.postIds + "," + post?.post_id,
                    });
                    setShowPostSearch(false);
                    refetch();
                  }}
                />
              )}
              <Button
                size={"sm"}
                alignSelf={"center"}
                mt={2}
                onClick={() => {
                  setShowPostSearch(true);
                }}
              >
                Add more post
              </Button>
            </>
          )}
        </VStack>
      </Card>
    );
  }
);
MiniPostCardRenderer.displayName = "MiniPostRenderer";
