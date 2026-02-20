"use client";

import { Box, Button, Heading, HStack } from "@chakra-ui/react";
import React, { FC } from "react";

import PageWrapper from "../../PageWrapper";
import { PostsCards } from "@/themes/smooth-land/PostsCards";
import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { FeaturedPost } from "@/themes/smooth-land/FeaturedPost";
import { FeaturedPostType, PaginatedResponse, PostSelect } from "@/types";
import isEmpty from "just-is-empty";
import { useColorModeValue } from "@/components/ui/color-mode";

interface FrontPageProps {
  featuredPost: FeaturedPostType;
  postsWithMeta?: PaginatedResponse<PostSelect>;
}
const FrontPage: FC<FrontPageProps> = ({ featuredPost, postsWithMeta }) => {
  // const [loading, setLoading] = useState(false);
  // const [canFetch, setCanFetch] = useState(false);
  // const {
  //   updateParams,
  //   posts: clientPosts,
  //   loading: loading,
  // } = usePosts({ canFetch });
  // const canFetchRef = useRef(false);
  // const searchParams = useSearchParams();
  // // const [_posts, setPosts] = useState(posts);
  // const [category] = useQueryState("category");
  // useEffect(() => {}, []);
  // useEffect(() => {
  //   if (category) {
  //     setCanFetch(true);

  //     setLoading(loading);
  //     // setPosts(clientPosts);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [category]);
  const bgColor = useColorModeValue("white", "brand.700");
  return (
    <PageWrapper
      styleProps={{
        bg: bgColor,
      }}
    >
      <Box mb={12}>
        <Box
          maxW="1300px"
          mx="auto"
          px={{ base: 3, md: 4 }}
          // pt={2}
        >
          <Box px={{ base: 0, lg: 4 }}>
            {!isEmpty(featuredPost) && <FeaturedPost post={featuredPost} />}
            {/* <Box mt={0} mb={6}>
              <CategoryItemList
                onChange={(category) => updateParams({ category })}
              />
            </Box> */}

            <Box my={8}>
              <Heading>Recent Posts</Heading>
            </Box>
            <PostsCards posts={postsWithMeta?.data} loading={false} />
            {postsWithMeta?.meta && postsWithMeta?.meta.totalPages > 1 && (
              <HStack justify={"center"} my={8}>
                <Button asChild px={6} py={2}>
                  <Link href="/articles">
                    View all posts <LuArrowRight />
                  </Link>
                </Button>
              </HStack>
            )}
          </Box>
        </Box>
      </Box>
    </PageWrapper>
  );
};
export default FrontPage;
