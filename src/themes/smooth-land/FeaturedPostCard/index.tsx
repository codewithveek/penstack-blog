import { Avatar, Box, Grid, Heading, HStack, Image, LinkBox, LinkOverlay, Stack, Tag, Text, VStack, Skeleton, SkeletonText } from "@chakra-ui/react";
import { useFeaturedPost } from "@/hooks/useFeaturedPost";
import {
  decodeAndSanitizeHtml,
  generatePostUrl,
  nativeFormatDate,
  objectToQueryParams,
  stripHtml,
} from "@/utils";

import { useColorModeValue } from "@/components/ui/color-mode";

export default function FeaturedPostCard() {
  const { featuredPost, loading } = useFeaturedPost();
  const cardBgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  const textColor = useColorModeValue("white", "white");

  return (
    <Box
      bg={cardBgColor}
      rounded="xl"
      overflow={"hidden"}
      borderWidth={1}
      borderColor={borderColor}
      transition="all 0.2s"
      pos={"relative"}
      h={{ base: 350, md: 500, lg: 600 }}
      // minH={450}
    >
      {loading ? (
        <Stack
          h={"full"}
          minH={350}
          gap={4}
          px={{ base: 3, sm: 6, lg: 8 }}
          py={{ base: 3, sm: 6 }}
        >
          <Skeleton height="350px" rounded={"lg"} />
          <Skeleton height="25px" rounded={"xl"} />
          <Skeleton height="15px" width="100px" rounded={"xl"} />
          <SkeletonText noOfLines={3} rounded={"xl"} />
        </Stack>
      ) : (
        featuredPost && (
          <>
            <Box position="absolute" h={"full"} w={"full"}>
              <Image
                w={"full"}
                h={"full"}
                objectFit={"cover"}
                src={
                  featuredPost?.featured_image?.url ||
                  `/api/og?${objectToQueryParams({
                    title: featuredPost.title,
                    date: featuredPost?.published_at
                      ? featuredPost?.published_at
                      : featuredPost?.created_at,

                    category: featuredPost?.category?.name,
                  })}`
                }
                alt={featuredPost?.featured_image?.alt_text || ""}
              />
            </Box>
            <Stack
              justify={"flex-end"}
              pos={"relative"}
              h={"full"}
              minH={350}
              backgroundImage={
                featuredPost?.featured_image?.url
                  ? "linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.61))"
                  : ""
              }
            >
              <VStack
                align="start"
                gap={4}
                px={{ base: 3, sm: 6, lg: 8 }}
                py={{ base: 3, sm: 6, lg: 8 }}
                justify="space-between"
              >
                <VStack align="start" maxW={900}>
                  <Box>
                    <Text color={textColor} fontWeight={500} fontSize={"large"}>
                      Featured
                    </Text>
                  </Box>
                  <LinkOverlay href={generatePostUrl(featuredPost)}>
                    <Heading color={"white"} size="2xl" mb={4}>
                      {featuredPost.title}
                    </Heading>
                  </LinkOverlay>
                  <Text color={textColor} fontSize="lg" noOfLines={3}>
                    {featuredPost.summary ||
                      stripHtml(
                        decodeAndSanitizeHtml(featuredPost.content || "")
                      )}
                  </Text>
                </VStack>
              </VStack>
            </Stack>
          </>
        )
      )}
    </Box>
  );
}
