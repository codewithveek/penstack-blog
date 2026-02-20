import { useAuth } from "@/hooks/useAuth";
import {
  Avatar,
  Button,
  HStack,
  Menu,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { signOut, useSession } from "@/lib/auth/auth-client";
import { LuLogOut } from "react-icons/lu";

export const UserInfoComp = ({ showLabel = true }: { showLabel?: boolean }) => {
  const { user } = useAuth();
  const bgColor = useColorModeValue("gray.100", "gray.800");
  const borderColor = useColorModeValue("gray.400", "gray.500");
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button
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
            <Avatar.Root size={"sm"}>
              <Avatar.Image src={user?.image || (user as any)?.avatar} />
            </Avatar.Root>
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
        </Button>
      </Menu.Trigger>
      <Menu.Content rounded={"2xl"} px={3}>
        <Menu.Item
          value="logout"
          color={"red.400"}
          rounded={"full"}
          onClick={() => signOut().then(() => (window.location.href = "/"))}
        >
          <LuLogOut /> Logout
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
};
