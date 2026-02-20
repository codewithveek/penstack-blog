import { HStack, Icon, List, Switch, Text } from "@chakra-ui/react";

import { LuPin, LuStickyNote } from "react-icons/lu";
import { PermissionGuard } from "../../../PermissionGuard";
import { TocActionsProps } from "../types";

export const TocActions = ({ generateToc, onChange }: TocActionsProps) => {
  return (
    // <PermissionGuard requiredPermission="posts:publish">
    <List.Item>
      <HStack>
        <Text as="span" color="gray.500">
          <Icon mr={1}>
            <LuStickyNote />
          </Icon>
          Generate Table of Content:
        </Text>
        <Switch.Root checked={generateToc} onChange={onChange} size={"sm"} />
      </HStack>
    </List.Item>
    // </PermissionGuard>
  );
};
