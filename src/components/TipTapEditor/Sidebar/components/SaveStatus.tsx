import { HStack, Spinner, Stack, Text } from "@chakra-ui/react";
import { LuCheck } from "react-icons/lu";

export const SaveStatus = ({ isSaving }: { isSaving: boolean }) => {
  return (
    <HStack>
      {isSaving ? (
        <Spinner size="xs" />
      ) : (
        <Stack
          align="center"
          justify="center"
          w="14px"
          h="14px"
          rounded="full"
          bg="green.400"
        >
          <LuCheck size={12} color="white" />
        </Stack>
      )}
      <Text as="span" color={isSaving ? "gray.300" : undefined}>
        {isSaving ? "Saving..." : "Saved"}
      </Text>
    </HStack>
  );
};
