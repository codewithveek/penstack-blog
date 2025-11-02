import { HStack, Icon, ListItem, Switch, Text } from "@chakra-ui/react";
import { LuMessageSquare } from "react-icons/lu";
import { PermissionGuard } from "../../../PermissionGuard";
import { CommentsToggleProps } from "../types";

export const CommentsToggle = ({
  allowComments,
  onChange,
}: CommentsToggleProps) => {
  return (
    <PermissionGuard requiredPermission="posts:publish">
      <ListItem>
        <HStack>
          <Text as="span" color="gray.500">
            <Icon as={LuMessageSquare} mr={1} />
            Allow Comments:
          </Text>
          <Switch isChecked={allowComments} onChange={onChange} size={"sm"} />
        </HStack>
      </ListItem>
    </PermissionGuard>
  );
};
