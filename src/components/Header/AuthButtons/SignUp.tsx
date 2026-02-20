import { Button } from "@chakra-ui/react";
import Link from "next/link";

import { useColorModeValue } from "@/components/ui/color-mode";

export const SignUp = () => {
  const hoverBgSignup = useColorModeValue("brand.600", "brand.400");

  return (
    <Button
      asChild
      py={2}
      size={"sm"}
      h="auto"
      _hover={{
        textDecor: "none",
        bg: hoverBgSignup,
      }}
    >
      <Link href="/auth/signup">Sign up</Link>
    </Button>
  );
};
