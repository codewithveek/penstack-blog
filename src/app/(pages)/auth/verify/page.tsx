"use client";

import { Container, VStack, Heading, Text, Button, Input } from "@chakra-ui/react";

import { useState, useEffect, useRef } from "react";

import axios from "axios";
import { useQueryState } from "nuqs";
import PageWrapper from "@/components//PageWrapper";
import { toaster } from "@/components/ui/toaster";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  
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
        toaster.create({
          title: "Verification email sent",
          description: "Please check your inbox",
          type: "success",
        });
        setCanResend(false);
        setCountdown(60);
      } else {
        throw new Error("Failed to send verification email");
        hasSent.current = false;
      }
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "Failed to send verification email",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      hasSent.current = false;
    }
  };

  return (
    <PageWrapper>
      <Container maxW="md" py={{ base: 12, md: 24 }}>
        <VStack gap={8}>
          <VStack gap={3} textAlign="center">
            <Heading size="xl">Verify Your Email</Heading>
            <Text color="gray.500">
              Please verify your email address to continue. Haven&apos;t
              received the email yet?
            </Text>
          </VStack>

          <VStack gap={4} width="full">
            <Input
              placeholder="Enter your email"
              value={email || initialEmail || ""}
              onChange={(e) => setEmail(e.target.value)}
              size="lg"
              disabled
            />
            <Button
              onClick={handleResend}
              loading={loading}
              disabled={!canResend}
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
