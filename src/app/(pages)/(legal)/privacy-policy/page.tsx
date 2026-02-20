"use client";

import { Box, Container, Heading, Text, List } from "@chakra-ui/react";

import PageWrapper from "@/components//PageWrapper";
import Link from "next/link";


export default function PrivacyPolicy() {
  return (
    <PageWrapper>
      <Container maxW="container.lg" py={12}>
        <Heading>Privacy Policy</Heading>
        <Box>
          <Heading as="h2" size="lg" mb={4}>
            Introduction
          </Heading>
          <Text mb={6}>
            This Privacy Policy explains how we collect, use, and protect your
            personal information when you use our services.
          </Text>

          <Heading as="h2" size="lg" mb={4}>
            Information We Collect
          </Heading>
          <Text mb={4}>
            We collect information that you provide directly to us, including:
          </Text>
          <List.Root mb={6} gap={2}>
            <List.Item>Name and contact information</List.Item>
            <List.Item>Account credentials</List.Item>
            <List.Item>Payment information</List.Item>
            <List.Item>Usage data and preferences</List.Item>
          </List.Root>

          <Heading as="h2" size="lg" mb={4}>
            How We Use Your Information
          </Heading>
          <Text mb={4}>We use the collected information to:</Text>
          <List.Root mb={6} gap={2}>
            <List.Item>Provide and maintain our services</List.Item>
            <List.Item>Process your transactions</List.Item>
            <List.Item>Send you important updates and notifications</List.Item>
            <List.Item>Improve our services and user experience</List.Item>
          </List.Root>

          <Heading as="h2" size="lg" mb={4}>
            Data Security
          </Heading>
          <Text mb={6}>
            We implement appropriate security measures to protect your personal
            information from unauthorized access, alteration, or disclosure.
          </Text>

          <Heading as="h2" size="lg" mb={4}>
            Third-Party Services
          </Heading>
          <Text mb={6}>
            We may use third-party services that collect, monitor, and analyze
            user data to improve our service quality.
          </Text>

          <Heading as="h2" size="lg" mb={4}>
            Your Rights
          </Heading>
          <Text mb={4}>You have the right to:</Text>
          <List.Root mb={6} gap={2}>
            <List.Item>Access your personal data</List.Item>
            <List.Item>Request corrections to your data</List.Item>
            <List.Item>Request deletion of your data</List.Item>
            <List.Item>Opt-out of marketing communications</List.Item>
          </List.Root>

          <Heading as="h2" size="lg" mb={4}>
            Updates to Privacy Policy
          </Heading>
          <Text mb={6}>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
          </Text>

          <Heading as="h2" size="lg" mb={4}>
            Contact Us
          </Heading>
          <Text>
            If you have any questions about this Privacy Policy, please{" "}
            <Link href={"/contact"}> contact us</Link>.
          </Text>
        </Box>
      </Container>
    </PageWrapper>
  );
}
