import { Box, GridItem, HStack, Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

export function PostCardLoader() {
  return (
    <GridItem rounded={"lg"} overflow={"hidden"}>
      <Box p={0}>
        <Skeleton height="200px" rounded={"xl"} />

        <HStack my={3} gap={4}>
          <SkeletonText w={120} noOfLines={1} rounded={"full"} />
          <SkeletonText w={120} noOfLines={1} rounded={"full"} />
        </HStack>
        <SkeletonText mt="4" noOfLines={4} gap="3" rounded={"full"} />
        <HStack mt={3}>
          <SkeletonCircle size="10" />
          <SkeletonText w={24} noOfLines={1} rounded={"full"} />
        </HStack>
      </Box>
    </GridItem>
  );
}
