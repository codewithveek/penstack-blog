import { useAuth } from "@/hooks/useAuth";
import { HStack, Menu, Avatar, Button } from "@chakra-ui/react";

import { signOut } from "@/lib/auth/auth-client";
import { LuChevronDown, LuLogOut } from "react-icons/lu";

export const UserMenu = () => {
  const { user } = useAuth();

  return (
    <HStack ml={"auto"}>
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button pl={1} variant={"outline"} rounded={"full"} size={"sm"}>
            <Avatar.Root
              size={"xs"}
              name={user?.name}
              src={(user as any)?.avatar || user?.image}
            />
            Hi, {user?.name?.split(" ")[0]}
            <LuChevronDown />
          </Button>
        </Menu.Trigger>
        <Menu.Content px={2} minW={"200px"} rounded={"lg"}>
          <Menu.Item
            value="logout"
            color="red.500"
            _hover={{ bg: "red.100" }}
            fontWeight={"semibold"}
            rounded={"lg"}
            onClick={() => {
              signOut();
            }}
          >
            <LuLogOut /> Logout
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </HStack>
  );
};
