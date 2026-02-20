"use client";

import { Grid } from "@chakra-ui/react";
import { usePosts } from "@/hooks";

import PostCard from "../../smooth-land/PostCard";
import { NewPostCardLoader } from "../NewPostCardLoader";
import NewPostCard from "../NewPostCard";
import { useColorModeValue } from "@/components/ui/color-mode";
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
