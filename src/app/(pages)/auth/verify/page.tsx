"use client";

import { useState, useEffect, useRef } from "react";
import {
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useQueryState } from "nuqs";
import PageWrapper from "@/components//PageWrapper";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const toast = useToast({ position: "top", duration: 10000 });
  const hasSent = useRef(false);
  const [initialEmail] = useQueryState("email");
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    const emailToUse = initialEmail;
    if (emailToUse && !hasSent.current) {
      handleResend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEmail]);

  const handleResend = async () => {
    setIsLoading(true);
    hasSent.current = true;
    try {
      const res = await axios.post("/api/auth/send-verification", {
        email: (email || initialEmail)?.toLowerCase(),
      });
      if (res.status >= 200 && res.status < 400) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox",
          status: "success",
        });
        setCanResend(false);
        setCountdown(60);
      } else {
        throw new Error("Failed to send verification email");
        hasSent.current = false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email",
        status: "error",
      });
    } finally {
      setIsLoading(false);
      hasSent.current = false;
    }
  };

  return (
    <PageWrapper>
      <Container maxW="md" py={{ base: 12, md: 24 }}>
        <VStack spacing={8}>
          <VStack spacing={3} textAlign="center">
            <Heading size="xl">Verify Your Email</Heading>
            <Text color="gray.500">
              Please verify your email address to continue. Haven&apos;t
              received the email yet?
            </Text>
          </VStack>

          <VStack spacing={4} width="full">
            <Input
              placeholder="Enter your email"
              value={email || initialEmail || ""}
              onChange={(e) => setEmail(e.target.value)}
              size="lg"
              isDisabled
            />
            <Button
              onClick={handleResend}
              isLoading={isLoading}
              isDisabled={!canResend}
              size="lg"
              width="full"
            >
              {canResend
                ? "Resend Verification Email"
                : `Resend in ${countdown}s`}
            </Button>
          </VStack>
        </VStack>
      </Container>
    </PageWrapper>
  );
}
