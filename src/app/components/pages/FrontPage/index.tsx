"use client";
import React, { FC } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import PageWrapper from "../../PageWrapper";
import { PostsCards } from "@/themes/smooth-land/PostsCards";
import { Link } from "@chakra-ui/next-js";
import { LuArrowRight } from "react-icons/lu";
import { FeaturedPost } from "@/themes/smooth-land/FeaturedPost";
import { FeaturedPostType, PaginatedResponse, PostSelect } from "@/types";
import isEmpty from "just-is-empty";

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
  //   loading: isLoading,
  // } = usePosts({ canFetch });
  // const canFetchRef = useRef(false);
  // const searchParams = useSearchParams();
  // // const [_posts, setPosts] = useState(posts);
  // const [category] = useQueryState("category");
  // useEffect(() => {}, []);
  // useEffect(() => {
  //   if (category) {
  //     setCanFetch(true);

  //     setLoading(isLoading);
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
                <Button
                  as={Link}
                  href={"/articles"}
                  px={6}
                  py={2}
                  rightIcon={<LuArrowRight />}
                >
                  View all posts
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
