"use client";

import { Box, Container, VStack, Flex, useBreakpointValue, HStack, Breadcrumb, Text } from "@chakra-ui/react";
import React, { Suspense, useEffect, useState } from "react";

import { PostSelect, SiteSettings } from "@/types";
import Loader from "../../Loader";
import PageWrapper from "../../PageWrapper";
import { generatePostDescription } from "@/utils";
import { ArticleHeader } from "./ArticleHeader";
import { ArticleContent } from "./ArticleContent";
import { Newsletter } from "../../NewsLetter";
import { LuChevronRight } from "react-icons/lu";
import { ThemedSocialShareGroup } from "../../SocialShares";
import dynamic from "next/dynamic";
import { useColorModeValue } from "@/components/ui/color-mode";

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

  if (!post) {
    return <Loader />;
  }
  return (
    <PageWrapper styleProps={{ px: 0, bg: bgColor }}>
      {settings.localPostAnalytics?.enabled && (
        <ViewTracker postId={post?.id} />
      )}

      {/* Post Content Section */}
      <Container
        maxW={1250}
        pr={{ lg: 12 }}
        className="py-8 relative px-4 md:px-5 lg:px-8"
      >
        <Breadcrumb.Root
          hideBelow={"lg"}
          gap="8px"
          fontSize={"0.9em"}
          display={"flex"}
          justifyContent={{ base: "start", md: "center" }}
          separator={<LuChevronRight color={metaColor} />}
          mb={6}
          listProps={{ flexWrap: "wrap" }}
        >
          <Breadcrumb.Item>
            <Breadcrumb.Link
              href="/"
              color={"var(--link-color)"}
              fontWeight={500}
            >
              Home
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          {post?.category && (
            <Breadcrumb.Item>
              <Breadcrumb.Link
                href={`/category/${post?.category.slug}`}
                color={"var(--link-color)"}
                fontWeight={500}
              >
                {post?.category.name}
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item
            isCurrentPage
            color={metaColor}
            className="text-wrap "
          >
            <Text>{post?.title}</Text>
          </Breadcrumb.Item>
        </Breadcrumb.Root>
        <HStack
          gap={1}
          align={"center"}
          wrap={"wrap"}
          // bg={newsletterBgColor}
          px={{ base: 4, lg: 0 }}
          py={{ base: 2, lg: 0 }}
          hideBelow={"1024px"}
          className="h-full top-1/2 hidden bottom-10 lg:fixed left-0 lg:left-0 xl:left-6 z-10 -translate-y-1/2 before:h-full before:w-1.5 before:bg-gray-200 before:absolute before:left-1/2 before:-translate-x-1/2"

          // zIndex={{ base: 4, lg: 0 }}
        >
          <Box bg={bgColor} className="z-10 py-4">
            <ThemedSocialShareGroup
              showLabels={false}
              url={shareUrl}
              theme="plain"
              variant="flat"
              orientation="vertical"
              // className="h-8"
              // size="lg"
              title={post?.title || ""}
              platforms={["copy", "x", "facebook", "linkedin", "email"]}
              hashtags={post?.tags?.map((tag) => tag.slug) || []}
              summary={generatePostDescription(post)}
            />
          </Box>
        </HStack>
        <ArticleHeader post={post} />

        {/* Main Content Area */}
        <Flex
          gap={{ base: 4, md: 5, lg: 6, xl: 10 }}
          w="full"
          justify={"space-between"}
          flexDirection={{ base: "column", lg: "row" }}
        >
          <ArticleContent post={post} />
          <VStack
            w={sidebarWidth || "320px"}
            minW={{ base: "full", md: 320 }}
            pt={4}
            gap={4}
            alignSelf={"start"}
            position="sticky"
            style={{ scrollPaddingTop: "10px" }}
            top={{ base: 0, lg: 55 }}
            alignItems={"stretch"}
            // zIndex={{ base: 40, lg: 0 }}
            pb={6}
          >
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
