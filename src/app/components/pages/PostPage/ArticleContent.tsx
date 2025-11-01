import React from "react";
import { Box, HStack, Tag, Text } from "@chakra-ui/react";
import { PostSelect } from "@/types";
import { ContentRenderer } from "../../Renderers/ContentRenderer";

import { decodeAndSanitizeHtml } from "@/utils";
import { LuTags } from "react-icons/lu";
import { TOCRenderer } from "../../Renderers/TOCRenderer";

interface ArticleContentProps {
  post: PostSelect;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ post }) => {
  return (
    <Box
      w="full"
      pb={{ base: 4, md: 6, lg: 8 }}
      // flexShrink={0}
      flexGrow={1}
      maxW="container.lg"
    >
      <Box display={{ base: "block", lg: "none" }} pt={5}>
        {post?.toc && post?.toc.length > 0 && (
          <TOCRenderer content={post?.toc || []} />
        )}
      </Box>
      <ContentRenderer content={decodeAndSanitizeHtml(post?.content || "")} />
      <Box my={2}>
        {post?.tags && post?.tags?.length > 0 && (
          <HStack wrap={"wrap"} gap={2} mb={4} mt={5}>
            <HStack fontWeight={500} color={"gray.600"}>
              <LuTags />{" "}
              <Text as={"span"} fontWeight={500} color={"gray.700"}>
                Tags:
              </Text>
            </HStack>
            <HStack wrap="wrap" gap={2}>
              {post?.tags?.map((tag, index) => (
                <Tag
                  key={index}
                  rounded={"md"}
                  px={3}
                  textTransform={"capitalize"}
                  borderColor={"gray.400"}
                  borderWidth={1}
                  color={"gray.800"}
                  fontWeight={500}
                  bg={"gray.200"}
                  _hover={{
                    bg: "gray.100",
                  }}
                >
                  {tag?.name}
                </Tag>
              ))}
            </HStack>
          </HStack>
        )}
      </Box>
    </Box>
  );
};
