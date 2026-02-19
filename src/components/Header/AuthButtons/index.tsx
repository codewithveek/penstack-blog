import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Button,
  ButtonGroup,
  HStack,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { SignUp } from "./SignUp";

export const AuthButtons = () => {
  const { user } = useAuth();
  const hoverBgLogin = useColorModeValue("brand.100", "gray.700");

  return user ? (
    <></>
  ) : (
    <HStack spacing={{ base: 3, md: 4 }}>
      <Button
        variant="ghost"
        as={Link}
        size="sm"
        href={"/auth/signin"}
        _hover={{
          textDecor: "none",
          bg: hoverBgLogin,
        }}
        py={"7px"}
        h="auto"
      >
        Log In
      </Button>
      <SignUp />
    </HStack>
  );
};
