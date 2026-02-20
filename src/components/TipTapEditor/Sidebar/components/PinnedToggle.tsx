import { HStack, Icon, List, Switch, Text } from "@chakra-ui/react";

import { LuPin } from "react-icons/lu";
import { PermissionGuard } from "../../../PermissionGuard";
import { PinnedToggleProps } from "../types";

export const PinnedToggle = ({ isSticky, onChange }: PinnedToggleProps) => {
  return (
    <PermissionGuard requiredPermission="posts:publish">
      <List.Item>
        <HStack>
          <Text as="span" color="gray.500">
            <Icon mr={1}><LuPin /></Icon>
            Pinned:
          </Text>
          <Switch.Root checked={isSticky} onChange={onChange} size={"sm"} />
        </HStack>
      </List.Item>
    </PermissionGuard>
  );
};
