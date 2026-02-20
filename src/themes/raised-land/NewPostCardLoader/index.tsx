import { Box, GridItem, HStack, Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";


export function NewPostCardLoader() {
  return (
    <GridItem
      rounded={"24"}
      overflow={"hidden"}
      borderWidth={1}
      borderColor={"gray.300"}
      p={4}
    >
      <Skeleton height="200px" rounded={"lg"} />
      <Box>
        <SkeletonText my={3} w={120} noOfLines={1} rounded={"full"} />
        <SkeletonText mt="4" noOfLines={4} gap="3" rounded={"full"} />
        <HStack mt={4}>
          <SkeletonCircle size="10" rounded={"lg"} />
          <SkeletonText w={24} noOfLines={1} rounded={"lg"} />
        </HStack>
      </Box>
    </GridItem>
  );
}
