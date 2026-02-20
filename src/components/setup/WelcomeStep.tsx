"use client";

import { VStack, Heading, Text, Button, Box, Icon, List } from "@chakra-ui/react";


import { LuCircleCheck } from "react-icons/lu";

interface WelcomeStepProps {
  onNext: (data: any) => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <VStack gap={8} align="stretch" py={4}>
      <Box textAlign="center">
        <Heading size="lg" mb={4}>
          Welcome to Your New Blog! 🎉
        </Heading>
        <Text color="gray.600" fontSize="lg">
          Let's get you set up in just a few minutes.
        </Text>
      </Box>

      <Box>
        <Text fontWeight="semibold" mb={4}>
          What we'll set up:
        </Text>
        <List.Root gap={3}>
          <List.Item>
            <List.Indicator as={LuCircleCheck} color="green.500" />
            Administrator account for managing your blog
          </List.Item>
          <List.Item>
            <List.Indicator as={LuCircleCheck} color="green.500" />
            Basic site information and branding
          </List.Item>
          <List.Item>
            <List.Indicator as={LuCircleCheck} color="green.500" />
            Organization details (optional)
          </List.Item>
          <List.Item>
            <List.Indicator as={LuCircleCheck} color="green.500" />
            Email service configuration (optional)
          </List.Item>
        </List.Root>
      </Box>

      <Box bg="blue.50" p={4} borderRadius="md">
        <Text fontSize="sm" color="blue.800">
          <strong>Note:</strong> You can always change these settings later from
          your dashboard.
        </Text>
      </Box>

      <Button onClick={() => onNext({})} colorPalette="blue" size="lg">
        Get Started
      </Button>
    </VStack>
  );
}
