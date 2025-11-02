import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import {
  Button,
  HStack,
  Icon,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { LuEye, LuGlobe, LuLock } from "react-icons/lu";

export const VisibilityItem = ({ visibility }: { visibility: string }) => {
  const updateField = useEditorPostManagerStore((state) => state.updateField);
  const handleVisibilityChange = (visibility: string) => {
    updateField("visibility", visibility as "public" | "private");
  };
  return (
    <ListItem>
      <HStack justify="space-between">
        <HStack>
          <Text as="span" color="gray.500">
            <Icon as={LuEye} mr={1} />
            Visibility:
          </Text>
          <Text as="span" fontWeight="semibold" textTransform="capitalize">
            {visibility}
          </Text>
        </HStack>
        <Menu>
          <MenuButton as={Button} variant="ghost" size="xs">
            Edit
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<LuGlobe />}
              onClick={() => handleVisibilityChange("public")}
            >
              Public
            </MenuItem>
            <MenuItem
              icon={<LuLock />}
              onClick={() => handleVisibilityChange("private")}
            >
              Private
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </ListItem>
  );
};
