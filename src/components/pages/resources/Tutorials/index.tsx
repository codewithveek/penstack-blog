"use client";

import { Box, SimpleGrid, Heading, Container, VStack } from "@chakra-ui/react";

import { PenstackYouTubeEmbed } from "@/components//Renderers/YoutubeEmbedRenderer";
import PageWrapper from "../../../PageWrapper";

const tutorials = [
  {
    id: 1,
    title: "Getting Started with Next.js 13",
    videoId: "ZVnjOPwW4ZA",
  },
  {
    id: 2,
    title: "Chakra UI Fundamentals",
    videoId: "iXsM6NkEmFc",
  },
  {
    id: 3,
    title: "Next.js 13 Blog: From Zero to Production",
    videoId: "puIQhnjOfbc",
  },
];
export default function TutorialsPage() {
  return (
    <PageWrapper>
      <Container maxW="container.xl" py={8}>
        <VStack gap={8} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center" mb={8}>
            Video Tutorials
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
            {tutorials.map((tutorial) => (
              <Box key={tutorial.id}>
                <PenstackYouTubeEmbed
                  node={{
                    attrs: {
                      videoId: tutorial.videoId,
                      title: tutorial.title,
                    },
                  }}
                  isEditing={false}
                />
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </PageWrapper>
  );
}
