import { useAuth } from "@/hooks/useAuth";
import {
  Avatar,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { LuLogOut } from "react-icons/lu";

export const UserInfoComp = ({ showLabel = true }: { showLabel?: boolean }) => {
  const { user } = useAuth();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const borderColor = useColorModeValue("gray.400", "gray.500");
  return (
    <Menu>
      <MenuButton
        as={Button}
        variant={"ghost"}
        rounded={"full"}
        bg={bgColor}
        px={1}
        py={1}
        border={"1px"}
        borderColor={borderColor}
        maxW={200}
      >
        <HStack justify={"start"}>
          <Avatar
            size={"sm"}
            name={user?.name}
            src={user?.image || user?.avatar}
          />
          {showLabel && (
            <Stack gap={0} pr={4} align={"baseline"}>
              <Text as={"span"} fontSize={"small"} fontWeight={500}>
                {user?.name}
              </Text>
              <Text
                as={"span"}
                color={borderColor}
                fontSize={"x-small"}
                textTransform={"lowercase"}
              >
                {user?.email}
              </Text>
            </Stack>
          )}
        </HStack>
      </MenuButton>
      <MenuList rounded={"2xl"} px={3}>
        <MenuItem
          icon={<LuLogOut />}
          color={"red.400"}
          rounded={"full"}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
