import { Text, ListItem, HStack, Icon } from "@chakra-ui/react";
import { LuFileText, LuType } from "react-icons/lu";
import { usePenstackEditorStore } from "@/state/penstack-editor";

export const MetricsItem = () => {
  const wordCount = usePenstackEditorStore((state) =>
    state.editor?.storage?.characterCount?.words()
  );
  const characterCount = usePenstackEditorStore((state) =>
    state.editor?.storage?.characterCount?.characters()
  );
  return (
    <>
      <ListItem>
        <HStack>
          <Text as="span" color="gray.500">
            <Icon as={LuFileText} mr={1} />
            Word count:
          </Text>
          <Text as="span" fontWeight="semibold">
            {wordCount}
          </Text>
        </HStack>
      </ListItem>
      <ListItem>
        <HStack>
          <Text as="span" color="gray.500">
            <Icon as={LuType} mr={1} />
            Character count:
          </Text>
          <Text as="span" fontWeight="semibold">
            {characterCount}
          </Text>
        </HStack>
      </ListItem>
    </>
  );
};
