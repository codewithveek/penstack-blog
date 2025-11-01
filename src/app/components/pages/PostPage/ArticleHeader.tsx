import React from "react";
import {
  Box,
  Text,
  Heading,
  HStack,
  useColorModeValue,
  Stack,
  Avatar,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { PostSelect } from "@/types";
import { Link } from "@chakra-ui/next-js";
import { formatDate } from "@/utils";
import { SocialShareGroup } from "./ShareButtons";

interface ArticleHeaderProps {
  post: PostSelect;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({ post }) => {
  const summaryColor = useColorModeValue("gray.600", "gray.400");
  const dividerColor = useColorModeValue("gray.600", "gray.400");

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <Box mb={{ base: 6, md: 10 }} px={{ base: 0, md: 2 }}>
      <Stack
        align={{ base: "flex-start", md: "center" }}
        as="header"
        mb={{ base: 2, md: 3 }}
        maxW={"950px"}
        mx={"auto"}
        spacing={2}
      >
        {post?.category?.name && (
          <Badge
            px={0}
            fontSize={{ base: "0.9em" }}
            py={1}
            mb={{ base: 0, md: 1 }}
            color={"brandPurple.500"}
            _dark={{ color: "brandPurple.300" }}
            bg="transparent"
            as={Link}
            href={`/category/${post?.category?.slug}`}
          >
            {post?.category?.name}
          </Badge>
        )}
        <Heading
          as="h1"
          mb={{ base: 1, md: 2 }}
          size={{ base: "xl", sm: "2xl", md: "3xl" }}
          // lineHeight={"1"}
          fontWeight={700}
          textAlign={{ base: "left", md: "center" }}
        >
          {post?.title}
        </Heading>

        {post?.summary && (
          <>
            {/* <Divider my={1} /> */}
            <Text
              fontSize={{ base: "md", md: "lg" }}
              my={2}
              maxW={"3xl"}
              color={summaryColor}
              fontWeight={"semibold"}
              textAlign={{ base: "left", md: "center" }}
            >
              {post?.summary}
            </Text>
          </>
        )}
      </Stack>
    </Box>
  );
};
