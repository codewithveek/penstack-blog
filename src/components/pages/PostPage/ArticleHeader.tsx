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
  Image,
  useBreakpointValue,
  StackDivider,
} from "@chakra-ui/react";
import { PostSelect } from "@/types";
import Link from "next/link";
import { ThemedSocialShareGroup } from "../../SocialShares";
import {
  generatePostDescription,
  nativeFormatDate,
  objectToQueryParams,
} from "@/utils";
import { LuBookOpen } from "react-icons/lu";

interface ArticleHeaderProps {
  post: PostSelect;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = ({ post }) => {
  const summaryColor = useColorModeValue("gray.600", "gray.400");
  const dividerColor = useColorModeValue("gray.500", "gray.400");

  const metaColor = useColorModeValue("gray.600", "gray.300");
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const featuredImage =
    useBreakpointValue({
      base:
        (post?.featured_image?.preview as string) || post?.featured_image?.url,
      md: post?.featured_image?.url,
    }) ||
    post?.featured_image?.preview ||
    `/api/og?${objectToQueryParams({
      title: post?.title,
      date: post?.published_at || post?.created_at,
      username: post?.author?.username,
      avatar: post?.author?.avatar,
      name: post?.author?.name,
      category: post?.category?.name,
      w: 1000,
      h: 500,
    })}`;
  return (
    <Box mb={{ base: 6, md: 10 }} px={{ base: 0, md: 2 }}>
      <Stack
        align={{ base: "flex-start", md: "center" }}
        as="header"
        mb={{ base: 2, md: 3 }}
        // maxW={"950px"}
        mx={"auto"}
        spacing={2}
      >
        <Box
          maxW={"1250px"}
          w={"full"}
          className="border-b relative border-gray-200 pb-3 mb-5"
        >
          <Box mb={6} w={"full"} className="relative overflow-hidden">
            <Image
              src={featuredImage}
              alt={post?.featured_image?.alt_text || post?.title || ""}
              width="full"
              height="full"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              maxH={600}
              // aspectRatio={"16/9"}
              objectFit="cover"
            />
          </Box>
          <Stack spacing={5} my={{ base: 6, lg: 10 }}>
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
                  fontWeight={"medium"}
                  textAlign={{ base: "left", md: "center" }}
                >
                  {post?.summary}
                </Text>
              </>
            )}
          </Stack>
          <HStack
            justify={{ base: "start", md: "center" }}
            align={"center"}
            gap={5}
            flexWrap={"wrap"}
            mx={"auto"}
            mt={2}
            maxW={750}
          >
            <Box>
              <HStack
                align={"center"}
                gap={1}
                divider={
                  <Box
                    w={1}
                    h={1}
                    border={"none"}
                    bg={dividerColor}
                    rounded={"full"}
                  />
                }
                wrap={"wrap"}
              >
                <HStack gap={2} align={"center"}>
                  <Avatar
                    src={post?.author.avatar || ""}
                    name={post?.author.name}
                    boxSize={"38px"}
                    width={"38px"}
                    height={"38px"}
                  />
                  <Text as="span" className="sr-only">
                    Written By
                  </Text>

                  <Link
                    href={"/author/" + post?.author.username}
                    fontWeight={600}
                    lineHeight={"tighter"}
                  >
                    {post?.author.name}
                  </Link>
                </HStack>
                <HStack
                  divider={
                    <Box
                      w={1}
                      h={1}
                      border={"none"}
                      bg={dividerColor}
                      rounded={"full"}
                    />
                  }
                  align={"center"}
                >
                  <Text as={"span"} fontSize={""}>
                    {nativeFormatDate(
                      new Date(
                        (post?.published_at
                          ? post?.published_at
                          : post?.created_at) as Date
                      )
                    )}
                  </Text>

                  <HStack>
                    <LuBookOpen size={16} />
                    <Text as={"span"} fontSize={""}>
                      {post?.reading_time || 1} min read
                    </Text>
                  </HStack>
                </HStack>
              </HStack>
            </Box>
            <HStack align={"center"} wrap={"wrap"} ml={{ md: "auto" }}>
              <HStack>
                <ThemedSocialShareGroup
                  showLabels={false}
                  url={shareUrl}
                  theme="plain"
                  variant="flat"
                  // className="h-10"
                  title={post?.title || ""}
                  platforms={["copy", "x", "facebook", "linkedin", "email"]}
                  hashtags={post?.tags?.map((tag) => tag.slug) || []}
                  summary={generatePostDescription(post)}
                />
              </HStack>
            </HStack>
          </HStack>
        </Box>
      </Stack>
    </Box>
  );
};
