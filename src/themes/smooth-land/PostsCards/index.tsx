"use client";
import { Grid } from "@chakra-ui/react";
import PostCard from "../PostCard";
import { PostCardLoader } from "../PostCardLoader";
import { PostSelect } from "@/types";
export function PostsCards({
  maxW,
  posts,
  loading,
  showAuthor,
  showBookmark,
}: {
  posts: PostSelect[] | undefined;
  loading?: boolean;
  showAuthor?: boolean;
  showBookmark?: boolean;
  maxW?: string | number | Record<any, any>;
}) {
  return (
    <Grid
      templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      // columnGap={{ base: 2, md: 2, lg: 3 }}
      gap={6}
      maxW={{ base: "100%", lg: (maxW as string | number) || "auto" }}
    >
      {loading
        ? Array.from({ length: 6 }).map((_, index) => (
            <PostCardLoader key={index} />
          ))
        : posts?.map((post) => (
            <PostCard showAuthor={showAuthor} key={post?.id} post={post} />
          ))}
    </Grid>
  );
}
