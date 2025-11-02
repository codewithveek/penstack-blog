import { Link } from "@chakra-ui/next-js";
import { Button, useColorModeValue } from "@chakra-ui/react";

export const SignUp = () => {
  const hoverBgSignup = useColorModeValue("brand.600", "brand.400");

  return (
    <Button
      as={Link}
      py={2}
      size={"sm"}
      h="auto"
      href={"/auth/signup"}
      _hover={{
        textDecor: "none",
        bg: hoverBgSignup,
      }}
    >
      Sign up
    </Button>
  );
};
