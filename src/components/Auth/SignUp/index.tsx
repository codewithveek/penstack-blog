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
  IconButton,
  Group,
  InputElement,
  Card,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { FaGithub, FaGoogle } from "react-icons/fa";
import { signIn } from "@/lib/auth/auth-client";
import axios from "axios";
import PageWrapper from "@/components//PageWrapper";
import { LuEye, LuEyeOff } from "react-icons/lu";
import Link from "next/link";
import { useColorModeValue } from "@/components/ui/color-mode";

export default function SignUp() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const dividerBg = useColorModeValue("white", "charcoalBlack");
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().toLowerCase();
    const name = formData.get("name")?.toString().toLowerCase();
    const password = formData.get("password");
    try {
      const { status, data } = await axios.post("/api/auth/signup", {
        name,
        email,
        password,
      });

      if (!(status >= 200 && status < 400)) {
        throw new Error(data?.message || "Failed to sign up");
      }

      setIsRedirecting(true);
      router.push("/auth/verify?email=" + email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper>
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
                      Account created! Redirecting to verification...
                    </Text>
                  </VStack>
                </Center>
              </Box>
            )}
            <VStack gap={5} align="stretch">
              <VStack gap={3}>
                <Heading size="xl">Sign up</Heading>
                <Text color="gray.500">Create your account</Text>
              </VStack>

              <form onSubmit={handleSubmit}>
                <VStack gap={4}>
                  <Field.Root required>
                    <Field.Label>Your Name:</Field.Label>
                    <Input name="name" required size="lg" />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>Email</Field.Label>
                    <Input name="email" type="email" required size="lg" />
                  </Field.Root>

                  {/* <Field.Root>
                <Field.Label>Username</Field.Label>
                <Input name="username" type="text" required size="lg" />
              </Field.Root> */}

                  <Field.Root required>
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

                  <Button
                    type="submit"
                    size="lg"
                    width="full"
                    loading={loading}
                  >
                    Sign up
                  </Button>
                </VStack>
              </form>
              <Box textAlign={"right"}>
                <Text as={"span"}>Already have an account?</Text>
                <Link href={"/auth/signin"} color={"brand.500"}>
                  {" "}
                  Sign In
                </Link>
              </Box>
              <Box position="relative" padding="10">
                <Separator />
                <AbsoluteCenter bg={dividerBg} px="4">
                  <Text color="gray.500">or</Text>
                </AbsoluteCenter>
              </Box>

              <Stack gap={4}>
                {/* <Button
                  onClick={() => signIn("github")}
                  leftIcon={<FaGithub />}
                  width="full"
                  size="lg"
                  colorPalette="gray"
                >
                  GitHub
                </Button> */}
                <Button
                  onClick={() => signIn.social({ provider: "google" })}
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
    </PageWrapper>
  );
}
