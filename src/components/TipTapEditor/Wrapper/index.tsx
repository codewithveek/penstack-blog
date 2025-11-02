import { Stack, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react";
import { TitleInput } from "../TitleInput";

export const EditorWrapper = ({ children }: { children: ReactNode }) => {
  const borderColor = useColorModeValue("gray.300", "gray.700");

  return (
    <Stack
      minH="100%"
      h="calc(var(--chakra-vh) - (var(--dash-header-h) + 32px))"
      flex={1}
      minW={{ base: 300, md: 350 }}
      pos="sticky"
      top="calc(var(--dash-header-h) + 16px)"
      width={{ base: "100%" }}
      bg={useColorModeValue("white", "gray.900")}
      border="1px"
      borderColor={borderColor}
      overflowY="hidden"
      rounded="xl"
      boxShadow="var(--card-raised)"
      gap={0}
    >
      <TitleInput />
      <Stack
        h="full"
        overflowY="auto"
        minH={300}
        bg={useColorModeValue("#f0f8ff", "transparent")}
        maxH="full"
        gap={0}
      >
        {children}
      </Stack>
    </Stack>
  );
};
