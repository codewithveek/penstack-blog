"use client";

import { signIn } from "@/lib/auth/auth-client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  Alert,
  AlertIcon,
  useToast,
  AbsoluteCenter,
  useColorModeValue,
  Center,
  Spinner,
  InputGroup,
  InputRightElement,
  IconButton,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import PageWrapper from "@/components//PageWrapper";
import { LuEye, LuEyeOff } from "react-icons/lu";
import Link from "next/link";

export default function SignIn() {
  return (
    <PageWrapper>
      <SignInComponent />
    </PageWrapper>
  );
}
export const SignInComponent = ({ cbUrl }: { cbUrl?: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const dividerBg = useColorModeValue("white", "charcoalBlack");
  const searchParams = useSearchParams();
  const callbackUrl = cbUrl || searchParams.get("callbackUrl") || "/";
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const emailOrUsername = formData
      .get("emailOrUsername")
      ?.toString()
      .toLowerCase();
    const password = formData.get("password")?.toString() || "";

    const result = await signIn.email({
      email: emailOrUsername || "",
      password,
    });

    if (result?.error) {
      const errorMsg = result.error.message || "Invalid credentials";
      if (errorMsg === "Please verify your email before signing in") {
        router.push(`/auth/verify?email=${emailOrUsername}`);
        return;
      }
      setError(errorMsg);
    } else {
      setIsRedirecting(true);
      router.push(callbackUrl);
    }

    setIsLoading(false);
  };

  return (
    <Container maxW="md" py={{ base: 8, md: 12 }} position="relative">
      <Card>
        <CardBody>
          {isRedirecting && (
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="blackAlpha.700"
              zIndex="overlay"
              borderRadius="md"
            >
              <Center height="100%">
                <VStack spacing={4}>
                  <Spinner size="xl" color="white" />
                  <Text color="white" fontSize="lg">
                    Successfully logged in! Redirecting...
                  </Text>
                </VStack>
              </Center>
            </Box>
          )}
          <VStack spacing={5} align="stretch">
            <VStack spacing={3}>
              <Heading size="xl">Sign in</Heading>
              <Text color="gray.500">Welcome back!</Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Email or Username</FormLabel>
                  <Input
                    name="emailOrUsername"
                    type="text"
                    required
                    size="lg"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="password"
                      type={show ? "text" : "password"}
                      required
                      size="lg"
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        onClick={handleClick}
                        aria-label={show ? "Hide password" : "Show password"}
                      >
                        {show ? <LuEye /> : <LuEyeOff />}
                      </IconButton>
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                {error && (
                  <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                >
                  Sign in
                </Button>
              </VStack>
            </form>
            <Box>
              <Text as={"span"}>Don&apos;t have an account yet?</Text>
              <Link href={"/auth/signup"} color={"brand.500"}>
                {" "}
                Create account
              </Link>
            </Box>
            <Box position="relative" padding="10">
              <Divider />
              <AbsoluteCenter bg={dividerBg} px="4">
                <Text color="gray.500">or </Text>
              </AbsoluteCenter>
            </Box>

            <Stack spacing={4}>
              {/* <Button
                onClick={() => signIn("github", { callbackUrl })}
                leftIcon={<FaGithub />}
                width="full"
                size="lg"
                colorScheme="gray"
              >
                GitHub
              </Button> */}
              <Button
                onClick={() => signIn.social({ provider: "google", callbackURL: callbackUrl })}
                leftIcon={<FaGoogle />}
                width="full"
                size="lg"
                borderRadius="xl"
                colorScheme="red"
              >
                Continue with Google
              </Button>
            </Stack>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};
