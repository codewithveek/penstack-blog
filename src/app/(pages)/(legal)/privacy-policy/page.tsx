"use client";

import PageWrapper from "@/components//PageWrapper";
import Link from "next/link";
import {
  Box,
  Container,
  Heading,
  Text,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";

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
          <UnorderedList mb={6} spacing={2}>
            <ListItem>Name and contact information</ListItem>
            <ListItem>Account credentials</ListItem>
            <ListItem>Payment information</ListItem>
            <ListItem>Usage data and preferences</ListItem>
          </UnorderedList>

          <Heading as="h2" size="lg" mb={4}>
            How We Use Your Information
          </Heading>
          <Text mb={4}>We use the collected information to:</Text>
          <UnorderedList mb={6} spacing={2}>
            <ListItem>Provide and maintain our services</ListItem>
            <ListItem>Process your transactions</ListItem>
            <ListItem>Send you important updates and notifications</ListItem>
            <ListItem>Improve our services and user experience</ListItem>
          </UnorderedList>

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
          <UnorderedList mb={6} spacing={2}>
            <ListItem>Access your personal data</ListItem>
            <ListItem>Request corrections to your data</ListItem>
            <ListItem>Request deletion of your data</ListItem>
            <ListItem>Opt-out of marketing communications</ListItem>
          </UnorderedList>

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
