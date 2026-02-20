"use client";

import { Container, VStack, Heading, Text, Box, Button, Field, Input, Textarea } from "@chakra-ui/react";

import axios from "axios";

import PageWrapper from "@/components//PageWrapper";


import { useState } from "react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";

export default function ContactPage() {
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await axios.post("/api/contact", formData);

      toaster.create({
        title: "Message sent",
        description: "We'll get back to you soon!",
        type: "success",
      });

      // Reset form
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description: error.response?.data?.error || "Failed to send message",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <PageWrapper>
      <Container maxW="container.md" py={{ base: 8, md: 16 }}>
        <VStack gap={8} align="stretch">
          <Box textAlign="center">
            <Heading as="h1" size="2xl" mb={4}>
              Get in Touch
            </Heading>
            <Text
              fontSize="lg"
              color={useColorModeValue("gray.600", "gray.400")}
            >
              Have questions or feedback? We&apos;d love to hear from you.
            </Text>
          </Box>

          <VStack
            as="form"
            onSubmit={handleSubmit}
            bg={bgColor}
            p={{ base: 4, sm: 5, lg: 8 }}
            rounded="lg"
            shadow="sm"
            borderWidth="1px"
            borderColor={borderColor}
            gap={6}
          >
            <Field.Root required>
              <Field.Label>Name</Field.Label>
              <Input
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label>Email</Field.Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Field.Root>
            <Field.Root required>
              <Field.Label>Message</Field.Label>
              <Textarea
                placeholder="Your message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
              />
            </Field.Root>
            <Button
              onClick={handleSubmit}
              size="lg"
              width="full"
              rounded="full"
              loading={isSubmitting}
            >
              Send Message
            </Button>
          </VStack>
        </VStack>
      </Container>
    </PageWrapper>
  );
}
