"use client";

import {
  Box,
  Button,
  Container,
  Separator,
  Field,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  Alert,
  AbsoluteCenter,
  Center,
  Spinner,
  Group,
  InputElement,
  IconButton,
  Card,
} from "@chakra-ui/react";

import { signIn } from "@/lib/auth/auth-client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { FaGithub, FaGoogle } from "react-icons/fa";
import PageWrapper from "@/components//PageWrapper";
import { LuEye, LuEyeOff } from "react-icons/lu";
import Link from "next/link";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";

export default function SignIn() {
  return (
    <PageWrapper>
      <SignInComponent />
    </PageWrapper>
  );
}
export const SignInComponent = ({ cbUrl }: { cbUrl?: string }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

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
      <Card.Root>
        <Card.Body>
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
                <VStack gap={4}>
                  <Spinner size="xl" color="white" />
                  <Text color="white" fontSize="lg">
                    Successfully logged in! Redirecting...
                  </Text>
                </VStack>
              </Center>
            </Box>
          )}
          <VStack gap={5} align="stretch">
            <VStack gap={3}>
              <Heading size="xl">Sign in</Heading>
              <Text color="gray.500">Welcome back!</Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack gap={4}>
                <Field.Root>
                  <Field.Label>Email or Username</Field.Label>
                  <Input
                    name="emailOrUsername"
                    type="text"
                    required
                    size="lg"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Password</Field.Label>
                  <Group className="w-full">
                    <Input
                      name="password"
                      type={show ? "text" : "password"}
                      required
                      size="lg"
                    />
                    <InputElement placement="end">
                      <IconButton
                        variant="ghost"
                        onClick={handleClick}
                        aria-label={show ? "Hide password" : "Show password"}
                      >
                        {show ? <LuEye /> : <LuEyeOff />}
                      </IconButton>
                    </InputElement>
                  </Group>
                </Field.Root>

                {error && (
                  <Alert.Root status="error" borderRadius="lg">
                    <Alert.Indicator />
                    {error}
                  </Alert.Root>
                )}

                <Button type="submit" size="lg" width="full" loading={loading}>
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
              <Separator />
              <AbsoluteCenter bg={dividerBg} px="4">
                <Text color="gray.500">or </Text>
              </AbsoluteCenter>
            </Box>

            <Stack gap={4}>
              {/* <Button
                onClick={() => signIn("github", { callbackUrl })}
                leftIcon={<FaGithub />}
                width="full"
                size="lg"
                colorPalette="gray"
              >
                GitHub
              </Button> */}
              <Button
                onClick={() =>
                  signIn.social({
                    provider: "google",
                    callbackURL: callbackUrl,
                  })
                }
                width="full"
                size="lg"
                borderRadius="xl"
                colorPalette="red"
              >
                <FaGoogle /> Continue with Google
              </Button>
            </Stack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Container>
  );
};
