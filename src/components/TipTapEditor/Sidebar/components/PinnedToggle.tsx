import { HStack, Icon, ListItem, Switch, Text } from "@chakra-ui/react";
import { LuPin } from "react-icons/lu";
import { PermissionGuard } from "../../../PermissionGuard";
import { PinnedToggleProps } from "../types";

export const PinnedToggle = ({ isSticky, onChange }: PinnedToggleProps) => {
  return (
    <PermissionGuard requiredPermission="posts:publish">
      <ListItem>
        <HStack>
          <Text as="span" color="gray.500">
            <Icon as={LuPin} mr={1} />
            Pinned:
          </Text>
          <Switch isChecked={isSticky} onChange={onChange} size={"sm"} />
        </HStack>
      </ListItem>
    </PermissionGuard>
  );
};
