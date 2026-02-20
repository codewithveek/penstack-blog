"use client";

import { Button, Container, Heading, Text, VStack, Image } from "@chakra-ui/react";


import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <html>
      <body>
        <Container maxW="container.xl" h="100vh" centerContent>
          <VStack gap={8} align="center" justify="center" h="full">
            <Image
              src="/assets/error.svg"
              alt="Error Illustration"
              boxSize="300px"
            />
            <Heading as="h1" size="2xl" textAlign="center">
              Something Went Wrong
            </Heading>
            <Text fontSize="xl" textAlign="center" maxW="600px">
              Oops! Something unexpected happened on our end. Don&apos;t worry -
              our team is already on it and working to get things back to
              normal.
            </Text>{" "}
            <VStack gap={4}>
              <Button size="lg" onClick={() => reset()}>
                Try Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/")}
              >
                Return Home
              </Button>
            </VStack>
          </VStack>
        </Container>
      </body>
    </html>
  );
}
