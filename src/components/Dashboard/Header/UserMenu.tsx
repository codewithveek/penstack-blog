import { useAuth } from "@/hooks/useAuth";
import {
  HStack,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  Button,
} from "@chakra-ui/react";

import { signOut } from "@/lib/auth/auth-client";
import { LuChevronDown, LuLogOut } from "react-icons/lu";

export const UserMenu = () => {
  const { user } = useAuth();

  return (
    <HStack ml={"auto"}>
      <Menu>
        <MenuButton
          as={Button}
          pl={1}
          leftIcon={
            <Avatar
              size={"xs"}
              name={user?.name}
              src={(user as any)?.avatar || user?.image}
            />
          }
          rightIcon={<LuChevronDown />}
          variant={"outline"}
          rounded={"full"}
          size={"sm"}
        >
          Hi, {user?.name?.split(" ")[0]}
        </MenuButton>
        <MenuList px={2} minW={"200px"} rounded={"lg"}>
          <MenuItem
            icon={<LuLogOut />}
            color="red.500"
            _hover={{ bg: "red.100" }}
            fontWeight={"semibold"}
            rounded={"lg"}
            onClick={() => {
              signOut();
            }}
          >
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  );
};
