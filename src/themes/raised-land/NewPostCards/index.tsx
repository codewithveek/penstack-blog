"use client";
import { usePosts } from "@/hooks";
import { Grid, useColorModeValue } from "@chakra-ui/react";
import PostCard from "../../smooth-land/PostCard";
import { NewPostCardLoader } from "../NewPostCardLoader";
import NewPostCard from "../NewPostCard";
export function NewPostsCards({
  maxW,
}: {
  maxW?: string | number | Record<any, any>;
}) {
  const bgColor = useColorModeValue("white", "gray.900");
  const { loading, posts } = usePosts();
  return (
    <Grid
      templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      gap={{ base: 5, md: 6, lg: 8 }}
      w={"full"}
      maxW={{ base: "100%", lg: (maxW as string | number) || "auto" }}
    >
      {loading
        ? Array.from({ length: 4 }).map((_, index) => (
            <NewPostCardLoader key={index} />
          ))
        : posts?.map((post) => <NewPostCard key={post?.id} post={post} />)}
    </Grid>
  );
}
