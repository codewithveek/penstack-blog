import { PostSelect } from "@/types";
import {
  decodeAndSanitizeHtml,
  generatePostUrl,
  nativeFormatDate,
  objectToQueryParams,
  stripHtml,
} from "@/utils";
import Link from "next/link";
import {
  Avatar,
  Box,
  Heading,
  HStack,
  IconButton,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
  Tag,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { LuBookmark } from "react-icons/lu";

export default function NewPostCard({
  post,
  showAuthor = true,
  showBookmark = true,
}: {
  showAuthor?: boolean;
  showBookmark?: boolean;
  post: PostSelect;
}) {
  const bgColor = useColorModeValue("white", "gray.800");
  const authorAreaBgColor = useColorModeValue("gray.100", "gray.700");
  const tagBgColor = useColorModeValue("brand.50", "brand.900");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  return (
    <Stack
      borderRadius="2xl"
      overflow="hidden"
      borderWidth={1}
      borderColor={borderColor}
      bg={bgColor}
      position="relative"
      shadow="md"
      p={4}
      transition="all 0.2s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
      spacing={4}
      as={LinkBox}
    >
      {post?.featured_image?.url && (
        <Box pos="relative" h="200px">
          <Image
            src={
              (post?.featured_image?.url as string) ||
              `/api/og?${objectToQueryParams({
                title: post?.title,
                date: post?.published_at
                  ? post?.published_at
                  : post?.created_at,
                username: post?.author?.username,
                avatar: post?.author?.avatar,
                name: post?.author?.name,
                category: post?.category?.name,
              })}`
            }
            alt={post?.featured_image?.alt_text || (post?.title as string)}
            w="full"
            h="full"
            objectFit="cover"
            rounded="2xl"
          />
        </Box>
      )}
      {post?.category && post?.category?.name && (
        <Box>
          <Tag
            size="md"
            colorScheme="brand"
            borderRadius="md"
            px={3}
            py={1}
            bg={tagBgColor}
            color={"brand.500"}
            textTransform={"capitalize"}
          >
            {post?.category.name}
          </Tag>
        </Box>
      )}
      <VStack align="stretch" flex={1} justify="space-between" spacing={2}>
        <Box p={2}>
          <LinkOverlay href={generatePostUrl(post)}>
            <Heading size="md" noOfLines={2} mb={2}>
              {post?.title}
            </Heading>
          </LinkOverlay>
          <Text fontSize="sm" color="gray.500" noOfLines={3}>
            {post?.summary ||
              stripHtml(decodeAndSanitizeHtml(post?.content || ""))}
          </Text>
        </Box>
        {(showAuthor || showBookmark) && (
          <HStack
            justify="space-between"
            align="center"
            alignSelf={showAuthor ? undefined : "end"}
            bg={authorAreaBgColor}
            p={2}
            borderRadius="xl"
          >
            {showAuthor && (
              <HStack spacing={2}>
                <Link href={`/author/${post?.author?.username}`}>
                  <Avatar
                    src={post?.author?.avatar || ""}
                    name={post?.author?.name}
                    borderRadius="md"
                    boxSize="32px"
                  />
                </Link>
                <VStack spacing={0} align="start">
                  <Link href={`/author/${post?.author?.username}`}>
                    <Text fontWeight="medium" fontSize="sm">
                      {post?.author?.name}
                    </Text>
                  </Link>
                  <Text fontSize="xs" color="gray.500">
                    {post?.published_at
                      ? nativeFormatDate(post?.published_at)
                      : nativeFormatDate(post?.updated_at as Date)}
                  </Text>
                </VStack>
              </HStack>
            )}
            {showBookmark && (
              <IconButton
                icon={<LuBookmark size={18} />}
                variant="ghost"
                aria-label="Bookmark"
                size="sm"
              />
            )}
          </HStack>
        )}
      </VStack>
    </Stack>
  );
}
