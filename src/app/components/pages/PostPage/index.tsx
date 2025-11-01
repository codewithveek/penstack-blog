"use client";
import React, { Suspense, useEffect, useState } from "react";
import {
  Box,
  Container,
  VStack,
  Flex,
  Image,
  useColorModeValue,
  useBreakpointValue,
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  Stack,
  Avatar,
} from "@chakra-ui/react";
import { PostSelect, SiteSettings } from "@/types";
import Loader from "../../Loader";
import PageWrapper from "../../PageWrapper";
import {
  generatePostDescription,
  nativeFormatDate,
  objectToQueryParams,
} from "@/utils";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleContent } from "./ArticleContent";
import { Newsletter } from "../../NewsLetter";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/next-js";
import { ThemedSocialShareGroup } from "../../SocialShares";
import dynamic from "next/dynamic";
import { TelegramFab } from "../../Telegram/Fab";
import { FaBoxes } from "react-icons/fa";

const ViewTracker = dynamic(
  () => import("../../ViewTracker").then((mod) => mod.ViewTracker),
  {
    ssr: false,
  }
);
const TOCRenderer = dynamic(
  () => import("../../Renderers/TOCRenderer").then((mod) => mod.TOCRenderer),
  {
    ssr: false,
  }
);
const CommentsSection = dynamic(
  () => import("./CommentSection").then((mod) => mod.CommentsSection),
  {
    ssr: false,
  }
);
const PostPage: React.FC<{ post: PostSelect; siteSettings: SiteSettings }> = ({
  post,
  siteSettings,
}) => {
  const settings = siteSettings;
  const sidebarWidth = useBreakpointValue({ base: "full", lg: "350px" });
  const canWrapNewsletter = useBreakpointValue({ base: false, lg: true });
  const metaColor = useColorModeValue("gray.600", "gray.300");
  const [shareUrl, setShareUrl] = useState("");

  const bgColor = useColorModeValue("white", "#121212");
  const newsletterBgColor = useColorModeValue("white", "gray.800");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href || "");
    }
  }, []);
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
  if (!post) {
    return <Loader />;
  }
  return (
    <PageWrapper styleProps={{ px: 0, bg: bgColor }}>
      {settings.localPostAnalytics?.enabled && (
        <ViewTracker postId={post?.id} />
      )}

      {/* Post Content Section */}
      <Container maxW="1250px" py={8} px={{ base: 4, md: 5, lg: 8 }}>
        <Breadcrumb
          hideBelow={"lg"}
          spacing="8px"
          fontSize={"0.9em"}
          display={"flex"}
          justifyContent={{ base: "start", md: "center" }}
          separator={<ChevronRightIcon color={metaColor} />}
          mb={6}
          listProps={{ flexWrap: "wrap" }}
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/"
              color={"var(--link-color)"}
              fontWeight={500}
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          {post?.category && (
            <BreadcrumbItem>
              <BreadcrumbLink
                href={`/category/${post?.category.slug}`}
                color={"var(--link-color)"}
                fontWeight={500}
              >
                {post?.category.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem
            isCurrentPage
            color={metaColor}
            className="text-wrap "
          >
            <Text>{post?.title}</Text>
          </BreadcrumbItem>
        </Breadcrumb>

        <ArticleHeader post={post} />
        <Box
          maxW={"1250px"}
          w={"full"}
          className="border-b border-gray-200 pb-3 mb-5"
        >
          <Box
            mb={6}
            w={"full"}
            className="relative h-[220px] sm:h-[360px] md:h-[400px] lg:h-[500px] xl:h-[600px] border-2 border-gray-200 rounded-lg overflow-hidden"
          >
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
          <HStack
            justify={"space-between"}
            gap={4}
            flexWrap={"wrap"}
            mx={"auto"}
            mt={2}
          >
            <Box>
              <HStack align={"center"}>
                <Avatar
                  src={post?.author.avatar || ""}
                  name={post?.author.name}
                  boxSize={"38px"}
                  width={"38px"}
                  height={"38px"}
                />
                <Stack gap={0}>
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
                  <HStack>
                    <Text as={"span"} fontSize={"14px"}>
                      {nativeFormatDate(
                        new Date(
                          (post?.published_at
                            ? post?.published_at
                            : post?.created_at) as Date
                        )
                      )}
                    </Text>
                    <Box w={1} h={1} rounded={"full"} bg={metaColor}></Box>
                    <Text as={"span"} fontSize={"14px"}>
                      {post?.reading_time || 1} min read
                    </Text>
                  </HStack>
                </Stack>
              </HStack>
            </Box>
            <HStack align={"center"} wrap={"wrap"} mt={4}>
              <Text as={"span"} fontWeight={"semibold"}>
                Share this:
              </Text>
              <HStack>
                <ThemedSocialShareGroup
                  showLabels={false}
                  url={shareUrl}
                  theme="brand"
                  variant="default"
                  className="h-10"
                  title={post?.title || ""}
                  platforms={["copy", "x", "facebook", "linkedin", "email"]}
                  hashtags={post?.tags?.map((tag) => tag.slug) || []}
                  summary={generatePostDescription(post)}
                />
              </HStack>
            </HStack>
          </HStack>
        </Box>
        {/* Main Content Area */}
        <Flex
          gap={{ base: 4, md: 5, lg: 6, xl: 10 }}
          w="full"
          justify={"space-between"}
          flexDirection={{ base: "column-reverse", lg: "row" }}
        >
          <VStack
            w={sidebarWidth || "320px"}
            minW={{ base: "full", md: 320 }}
            pt={4}
            spacing={4}
            alignSelf={"start"}
            position="sticky"
            style={{ scrollPaddingTop: "10px" }}
            top={{ base: 0, lg: 55 }}
            alignItems={"stretch"}
            zIndex={{ base: 40, lg: 0 }}
            pb={6}
          >
            <HStack
              gap={1}
              align={"center"}
              wrap={"wrap"}
              bg={newsletterBgColor}
              pos={{ base: "fixed", lg: "relative" }}
              w={"full"}
              px={{ base: 4, lg: 0 }}
              py={{ base: 2, lg: 0 }}
              bottom={0}
              left={0}
              zIndex={{ base: 4, lg: 0 }}
            >
              <Text as={"span"} fontWeight={"semibold"}>
                Share:
              </Text>
              <Box>
                <ThemedSocialShareGroup
                  showLabels={false}
                  url={shareUrl}
                  theme="brand"
                  variant="compact"
                  // className="h-8"
                  // size="lg"
                  title={post?.title || ""}
                  platforms={["copy", "x", "facebook", "linkedin", "email"]}
                  hashtags={post?.tags?.map((tag) => tag.slug) || []}
                  summary={generatePostDescription(post)}
                />
              </Box>
            </HStack>
            {post?.toc && post?.toc.length > 0 && (
              <Box display={{ base: "none", lg: "block" }} pt={0}>
                <TOCRenderer content={post?.toc || []} />
              </Box>
            )}
            <Box
              rounded={"xl"}
              mb={4}
              bg={newsletterBgColor}
              maxW={"full"}
              w={"full"}
              pt={{ base: 0, lg: 0 }}
            >
              <Newsletter
                title="Subscribe to our newsletter"
                description=" Get the latest posts delivered right to your inbox!"
                canWrap={canWrapNewsletter}
                maxW={"1200px"}
                isDark={false}
              />
            </Box>
          </VStack>
          <ArticleContent post={post} />
        </Flex>

        {post?.allow_comments && (
          <Suspense fallback={<Loader />}>
            <CommentsSection post={post} />
          </Suspense>
        )}
      </Container>
    </PageWrapper>
  );
};
export default PostPage;
