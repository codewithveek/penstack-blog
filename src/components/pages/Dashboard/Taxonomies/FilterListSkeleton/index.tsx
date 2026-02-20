import { Skeleton, Stack } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";


export const FilterListSkeleton = () => {
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  return (
    <Stack gap={2}>
      <Skeleton height="45px" w={"100%"} mb={1} rounded={"lg"} />
      {Array.from({ length: 4 }).map((_, index) => {
        return (
          <Skeleton
            key={index}
            bg={bgColor}
            height="55px"
            w={"100%"}
            border={1}
            borderColor={borderColor}
            rounded={"lg"}
          />
        );
      })}
    </Stack>
  );
};
