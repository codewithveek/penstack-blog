import { Button, ButtonGroup, HStack } from "@chakra-ui/react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

import { SignUp } from "./SignUp";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";

export const AuthButtons = () => {
  const { user } = useAuth();
  const hoverBgLogin = useColorModeValue("brand.100", "gray.700");

  return user ? (
    <></>
  ) : (
    <HStack gap={{ base: 3, md: 4 }}>
      <Button
        variant="ghost"
        asChild
        size="sm"
        _hover={{
          textDecor: "none",
          bg: hoverBgLogin,
        }}
        py={"7px"}
        h="auto"
      >
        <Link href="/auth/signin">Log In</Link>
      </Button>
      <SignUp />
    </HStack>
  );
};
