import { Text, List, HStack, Icon } from "@chakra-ui/react";

import { LuFileText, LuType } from "react-icons/lu";
import { usePenstackEditorStore } from "@/state/penstack-editor";

export const MetricsItem = () => {
  const wordCount = usePenstackEditorStore((state) =>
    (state.editor?.storage as any)?.characterCount?.words()
  );
  const characterCount = usePenstackEditorStore((state) =>
    (state.editor?.storage as any)?.characterCount?.characters()
  );
  return (
    <>
      <List.Item>
        <HStack>
          <Text as="span" color="gray.500">
            <Icon mr={1}>
              <LuFileText />
            </Icon>
            Word count:
          </Text>
          <Text as="span" fontWeight="semibold">
            {wordCount}
          </Text>
        </HStack>
      </List.Item>
      <List.Item>
        <HStack>
          <Text as="span" color="gray.500">
            <Icon mr={1}>
              <LuType />
            </Icon>
            Character count:
          </Text>
          <Text as="span" fontWeight="semibold">
            {characterCount}
          </Text>
        </HStack>
      </List.Item>
    </>
  );
};
