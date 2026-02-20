import {
  Box,
  Card,
  Heading,
  HStack,
  Image,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
  Stack,
  GridItem,
} from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";
import { PostSelect } from "@/types";
import {
  generatePostDescription,
  generatePostUrl,
  nativeFormatDate,
  objectToQueryParams,
} from "@/utils";
import Link from "next/link";

import { motion } from "framer-motion";
import { useColorModeValue } from "@/components/ui/color-mode";

export default function PostCard({
  post,
  showAuthor = true,
}: {
  showAuthor?: boolean;
  post: PostSelect;
}) {
  const textColor = useColorModeValue("gray.600", "gray.400");
  const tagBgColor = "transparent";
  const tagColor = useColorModeValue("brandPurple.600", "brandPurple.300");
  const bgColor = "none!important";
  return (
    <GridItem>
      <LinkBox>
        <Card.Root
          rounded={"none"}
          shadow={"none"}
          key={post?.id}
          bg={bgColor}
          maxW={{ base: "full", md: 380 }}
          overflow="hidden"
          transition="all 0.3s"
          css={{
            "&:hover": {
              ".post-card-img": {
                opacity: 0.8,
              },
            },
          }}
        >
          <Box
            position="relative"
            pb={0}
            rounded={"md"}
            overflow={"hidden"}
            height={"200px"}
            border={"1px solid"}
            borderColor={"brand.50"}
            mb={2}
          >
            <Image
              src={
                (post?.featured_image?.preview as string) ||
                (post?.featured_image?.url as string) ||
                `/api/og?${objectToQueryParams({
                  title: post?.title,
                  date: post?.published_at
                    ? post?.published_at
                    : post?.created_at,
                  username: post?.author?.username,
                  // avatar: post?.author?.avatar,
                  name: post?.author?.name,
                  w: 600,
                  h: 310,
                  category: post?.category?.name,
                  readingTime: post?.reading_time,
                })}`
              }
              alt={post?.featured_image?.alt_text || ""}
              objectFit="cover"
              className="post-card-img"
              transition={"all 0.3s"}
              h="full"
              width="full"
            />
          </Box>
          <Card.Body px={0} pt={3} pb={0} display={"flex"} flexDir={"column"}>
            <Stack flex={1}>
              <VStack align={"start"} gap={2} flex={1}>
                {post?.category && post?.category?.name && (
                  <Text
                    as="span"
                    bg={tagBgColor}
                    color={tagColor}
                    className="uppercase font-semibold text-xs"
                  >
                    {post?.category?.name}
                  </Text>
                )}
                <LinkOverlay
                  href={generatePostUrl(post)}
                  _hover={{ textDecoration: "underline" }}
                >
                  <Heading className="!text-xl" fontWeight={600} lineClamp={3}>
                    {post?.title}
                  </Heading>
                </LinkOverlay>

                <Text lineClamp={2} color={textColor} fontSize={"15px"}>
                  {generatePostDescription(post)}
                </Text>
              </VStack>
              {/* {showAuthor && ( */}
              <HStack gap={2} display={"inline-flex"} mt={1}>
                <Avatar
                  src={post?.author?.avatar || ""}
                  name={post?.author?.name}
                  // size="md"
                  boxSize={"36px"}
                  // w={"40px"}
                  // h={"40px"}
                />
                <Stack gap={0}>
                  <Link href={`/author/${post?.author?.username}`}>
                    <Text
                      fontWeight="600"
                      as={"span"}
                      fontSize={"smaller"}
                      _hover={{ textDecoration: "underline" }}
                    >
                      {post?.author?.name}
                    </Text>
                  </Link>

                  <HStack gap={1}>
                    <Text fontSize="smaller" as={"span"} color={textColor}>
                      {post?.published_at
                        ? `${nativeFormatDate(new Date(post?.published_at))}`
                        : `${nativeFormatDate(new Date(post?.updated_at as Date))}`}
                    </Text>
                    <Box w={"1"} h={1} bg={textColor} rounded="full"></Box>
                    <Text fontSize="smaller" as={"span"} color={textColor}>
                      {post?.reading_time || 1} min read
                    </Text>
                  </HStack>
                </Stack>
              </HStack>
              {/* )} */}
            </Stack>
          </Card.Body>
        </Card.Root>
      </LinkBox>
    </GridItem>
  );
}
