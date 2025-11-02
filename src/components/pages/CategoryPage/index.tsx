"use client";
import { Box, Container, Heading, Text } from "@chakra-ui/react";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PostSelect } from "@/types";
import { PostsCards } from "@/themes/smooth-land/PostsCards";
import PageWrapper from "../../PageWrapper";

export const CategoryPage = ({
  posts,
  categoryName,
}: {
  posts: any;
  categoryName: string;
}) => {
  // const params = useParams();
  // const categoryName = params.slug;

  // const { data: posts, isLoading } = useQuery({
  //   queryKey: ["category-posts", categorySlug],
  //   queryFn: async () => {
  //     const { data } = await axios.get<{ data: PostSelect[] }>(
  //       `/api/posts?category=${categorySlug}`
  //     );
  //     return data.data;
  //   },
  // });

  return (
    <PageWrapper>
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading as="h1" size="2xl" mb={2}>
            {categoryName}
          </Heading>
          <Text fontSize="lg">
            Posts in <Text as={"strong"}>&quot;{categoryName}&quot; </Text>{" "}
            category
          </Text>
        </Box>

        <PostsCards posts={posts} />
      </Container>
    </PageWrapper>
  );
};

export default CategoryPage;
