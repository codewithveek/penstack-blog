import { HStack, Icon, List, Switch, Text } from "@chakra-ui/react";

import { LuMessageSquare } from "react-icons/lu";
import { PermissionGuard } from "../../../PermissionGuard";
import { CommentsToggleProps } from "../types";

export const CommentsToggle = ({
  allowComments,
  onChange,
}: CommentsToggleProps) => {
  return (
    <PermissionGuard requiredPermission="posts:publish">
      <List.Item>
        <HStack>
          <Text as="span" color="gray.500">
            <Icon mr={1}><LuMessageSquare /></Icon>
            Allow Comments:
          </Text>
          <Switch.Root checked={allowComments} onChange={onChange} size={"sm"} />
        </HStack>
      </List.Item>
    </PermissionGuard>
  );
};
