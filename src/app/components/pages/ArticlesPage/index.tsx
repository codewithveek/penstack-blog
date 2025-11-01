"use client";
import { Box } from "@chakra-ui/react";
import PageWrapper from "../../PageWrapper";
import { PostsCards } from "../../../../themes/smooth-land/PostsCards";
import { usePosts } from "@/hooks";
import { CategoryItemList } from "../../CategoryItemList";
import { PostSelect } from "@/types";
import { useEffect, useState } from "react";
import { TelegramFab } from "../../Telegram/Fab";

export default function ArticlesPage({
  posts: initialPosts,
  initialCategory = "",
}: {
  posts: PostSelect[];
  initialCategory: string;
}) {
  const [categoryQuery, setCategoryQuery] = useState(initialCategory);
  const [canFetch, setCanFetch] = useState(false);
  const { posts, refetchPosts, loading, updateParams } = usePosts({
    canFetch,
    initialData: initialPosts,
  });
  useEffect(() => {
    setCanFetch(categoryQuery !== initialCategory);
    if (categoryQuery !== initialCategory) {
      refetchPosts();
    }
  }, [categoryQuery, initialCategory, refetchPosts]);
  return (
    <PageWrapper>
      {/* <TelegramFab /> */}

      <Box py={8} px={{ base: 3, lg: 4 }} maxW={"container.xl"} mx="auto">
        <Box>
          <Box mt={0} mb={6}>
            <CategoryItemList
              initialCategory={initialCategory}
              onChange={(category) => {
                setCategoryQuery(category);
                updateParams({ category });
              }}
            />
          </Box>
          <PostsCards posts={posts} loading={loading} />
        </Box>
      </Box>
    </PageWrapper>
  );
}
