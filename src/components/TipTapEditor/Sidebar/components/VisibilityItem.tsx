import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import { Button, HStack, Icon, Menu, Text } from "@chakra-ui/react";
import { LuEye, LuGlobe, LuLock } from "react-icons/lu";

export const VisibilityItem = ({ visibility }: { visibility: string }) => {
  const updateField = useEditorPostManagerStore((state) => state.updateField);
  const handleVisibilityChange = (visibility: string) => {
    updateField("visibility", visibility as "public" | "private");
  };
  return (
    <List.Item>
      <HStack justify="space-between">
        <HStack>
          <Text as="span" color="gray.500">
            <Icon mr={1}><LuEye /></Icon>
            Visibility:
          </Text>
          <Text as="span" fontWeight="semibold" textTransform="capitalize">
            {visibility}
          </Text>
        </HStack>
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button variant="ghost" size="xs">
              Edit
            </Button>
          </Menu.Trigger>
          <Menu.Content>
            <Menu.Item
              onClick={() => handleVisibilityChange("public")}
            >
              <LuGlobe /> Public
            </Menu.Item>
            <Menu.Item
              onClick={() => handleVisibilityChange("private")}
            >
              <LuLock /> Private
            </Menu.Item>
          </Menu.Content>
        </Menu.Root>
      </HStack>
    </List.Item>
  );
};
