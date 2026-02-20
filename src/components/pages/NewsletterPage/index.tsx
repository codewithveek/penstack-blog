"use client";

import {
  Box,
  VStack,
  Heading,
  Text,
  Flex,
  Field,
  Input,
  Button,
  Stack,
  Icon,
  Container,
  Badge,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";

import React, { useState } from "react";
import { LuSend, LuCode, LuZap, LuBookOpen, LuQuote } from "react-icons/lu";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import isEmpty from "just-is-empty";
import { Newsletter } from "../../NewsLetter";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Avatar } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Developer at Google",
    avatar: "/api/placeholder/40/40",
    content:
      "This newsletter helped me stay ahead of React trends. The weekly deep dives are gold!",
  },
  {
    name: "Mike Peterson",
    role: "Tech Lead at Microsoft",
    avatar: "/api/placeholder/40/40",
    content:
      "Best tech newsletter I've subscribed to. Clear, concise, and always relevant.",
  },
  {
    name: "Emma Rodriguez",
    role: "Fullstack Developer",
    avatar: "/api/placeholder/40/40",
    content:
      "The performance tips alone have saved me countless hours of debugging.",
  },
];

const Feature = ({
  icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <Stack direction="row" align="center" gap={2}>
    <Icon color="brand.500" boxSize={5}>
      {React.createElement(icon)}
    </Icon>
    <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
      {title}
    </Text>
  </Stack>
);

const Testimonial = ({
  content,
  name,
  role,
  avatar,
}: {
  content: string;
  name: string;
  role: string;
  avatar: string;
}) => (
  <Stack
    bg={useColorModeValue("white", "gray.800")}
    p={{ base: 5, md: 6 }}
    rounded="xl"
    border="1px"
    borderColor={useColorModeValue("gray.100", "gray.700")}
    gap={3}
    _hover={{ transform: "translateY(-4px)", shadow: "lg" }}
    transition="all 0.3s"
  >
    <Icon color="brand.500" boxSize={6}>
      <LuQuote />
    </Icon>
    <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
      &apos;{content}&apos;
    </Text>
    <HStack gap={3}>
      <Avatar src={avatar} size="sm" name={name} />
      <Box>
        <Text fontWeight="bold" fontSize="sm">
          {name}
        </Text>
        <Text fontSize="xs" color={useColorModeValue("gray.600", "gray.400")}>
          {role}
        </Text>
      </Box>
    </HStack>
  </Stack>
);

export const NewsletterPage = ({ title }: { title?: string }) => {
  const bgColor = useColorModeValue("brandPurple.50", "gray.900");
  const borderColor = useColorModeValue("brandPurple.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  return (
    <Container maxW="5xl" py={12}>
      <Box
        borderRadius="2xl"
        overflow="hidden"
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        p={{ base: 4, md: 6, lg: 8 }}
      >
        <VStack gap={8} align="center" textAlign="center">
          <Badge
            colorPalette="brandPurple"
            fontSize="sm"
            px={3}
            py={1}
            rounded="full"
          >
            Join 1,000+ Developers
          </Badge>

          <Heading size="lg" color={useColorModeValue("gray.900", "white")}>
            {title || "Level Up Your Dev Game"}
          </Heading>

          <Text color={textColor} maxW="2xl">
            Get weekly insights on latest tech trends, coding best practices,
            and career growth opportunities. No spam, just pure value delivered
            to your inbox.
          </Text>

          <Stack
            direction={{ base: "column", md: "row" }}
            gap={8}
            justify="center"
            w="full"
            maxW="2xl"
            py={4}
          >
            <Feature icon={LuCode} title="Latest Tech Deep Dives" />
            <Feature icon={LuZap} title="Performance Tips" />
            <Feature icon={LuBookOpen} title="Tutorial Collections" />
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} w="full">
            {testimonials.map((testimonial, idx) => (
              <Testimonial key={idx} {...testimonial} />
            ))}
          </SimpleGrid>

          <HStack w={"full"} mx={"auto"} justify={"center"} pt={4}>
            <Newsletter isDark={false} maxW={"full"} />
          </HStack>

          <Text fontSize="sm" color={textColor}>
            Join developers from Google, Microsoft, Amazon, and other top
            companies.
          </Text>
        </VStack>
      </Box>
    </Container>
  );
};
