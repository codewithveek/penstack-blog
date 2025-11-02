import { HStack, Icon, ListItem, Switch, Text } from "@chakra-ui/react";
import { LuPin, LuStickyNote } from "react-icons/lu";
import { PermissionGuard } from "../../../PermissionGuard";
import { TocActionsProps } from "../types";

export const TocActions = ({ generateToc, onChange }: TocActionsProps) => {
  return (
    // <PermissionGuard requiredPermission="posts:publish">
    <ListItem>
      <HStack>
        <Text as="span" color="gray.500">
          <Icon as={LuStickyNote} mr={1} />
          Generate Table of Content:
        </Text>
        <Switch isChecked={generateToc} onChange={onChange} size={"sm"} />
      </HStack>
    </ListItem>
    // </PermissionGuard>
  );
};
