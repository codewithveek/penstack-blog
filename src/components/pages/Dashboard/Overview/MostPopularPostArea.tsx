import { usePosts } from "@/hooks";
import {
  Avatar,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Stack,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { LuEye } from "react-icons/lu";
import Loader from "../../../Loader";
import { format } from "date-fns";
import { Link } from "@chakra-ui/next-js";
import { generatePostUrl } from "@/utils";
import { memo } from "react";
import { useSiteConfig } from "@/context/SiteConfig";

export default memo(function MostPopularPosts() {
  const { posts = [], loading } = usePosts({ sortBy: "popular", limit: 5 });
  const siteSettings = useSiteConfig();
  return (
    <Card minH={200} variant={"outline"}>
      <CardHeader>
        <Heading size={"md"}>Most Popular Posts</Heading>
      </CardHeader>
      {siteSettings?.localPostAnalytics.enabled ? (
        <CardBody>
          {loading && (
            <VStack>
              <Loader />
            </VStack>
          )}
          {!loading && !posts.length && (
            <VStack justify={"center"}>
              <Text color={"gray.400"} fontWeight={500}>
                No posts yet.
              </Text>
            </VStack>
          )}
          {!loading && posts && posts?.length > 0 && (
            <Stack gap={1} divider={<StackDivider />}>
              {posts.map((post, index) => (
                <HStack key={post?.id} justify={"space-between"}>
                  <Stack key={post?.id} justify={"space-between"}>
                    <HStack>
                      <Heading size={"sm"} noOfLines={1}>
                        <Link href={generatePostUrl(post)}>
                          <Text as={"span"} color={"green.500"} mr={2}>
                            #{index + 1}
                          </Text>
                          {post?.title}
                        </Link>
                      </Heading>
                    </HStack>
                    <HStack fontSize={"small"} color={"gray.400"}>
                      <LuEye />
                      <Text>{post?.views?.count} views</Text>
                    </HStack>
                  </Stack>
                  <HStack>
                    <Avatar
                      size={"xs"}
                      src={post?.author?.avatar || ""}
                      name={post?.author?.name}
                    />
                    <Stack spacing={"2px"}>
                      <Text noOfLines={1} fontWeight={500} fontSize={"smaller"}>
                        {post?.author?.name}
                      </Text>
                      <Text fontSize={"x-small"} color={"gray.400"}>
                        {format(post?.published_at as Date, "dd.MM.yyyy")}
                      </Text>
                    </Stack>
                  </HStack>
                </HStack>
              ))}
            </Stack>
          )}
        </CardBody>
      ) : (
        <CardBody h={300}>
          <VStack>
            <Heading size={"md"}> Not available</Heading>
            <Text color={"gray.500"} fontSize={"smaller"}>
              {" "}
              Post Analytics is disabled
            </Text>
          </VStack>
        </CardBody>
      )}
    </Card>
  );
});
