import { Box, Grid, HStack, LinkBox, Skeleton, SkeletonCircle, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";


export const FeaturedPostSkeleton = () => {
  const cardBgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <LinkBox mb={6} minH={400}>
      <Box
        bg={cardBgColor}
        borderRadius="3xl"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={6}>
          <Box position="relative" height={{ base: "300px", lg: "400px" }}>
            <Skeleton height="100%" width="100%" />
            <Skeleton
              position="absolute"
              top={4}
              left={4}
              height="32px"
              width="80px"
            />
          </Box>
          <VStack align="start" gap={4} p={6} justify="center">
            <Skeleton height="24px" width="100px" />
            <Skeleton height="60px" width="100%" />
            <Skeleton height="24px" width="100%" />
            <HStack gap={4} mt={4} width="100%">
              <SkeletonCircle size="40px" />
              <VStack align="start" gap={1} flex={1}>
                <Skeleton height="20px" width="120px" />
                <Skeleton height="16px" width="150px" />
              </VStack>
            </HStack>
          </VStack>
        </Grid>
      </Box>
    </LinkBox>
  );
};
