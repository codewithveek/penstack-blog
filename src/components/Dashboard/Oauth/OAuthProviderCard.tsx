"use client";

import { Box, Card, Heading, Text, HStack, IconButton, Badge, Switch, VStack, Tooltip } from "@chakra-ui/react";


import { LuPencil, LuTrash2 } from "react-icons/lu";

interface OAuthProvider {
  id: number;
  provider_name: string;
  display_name: string;
  client_id: string;
  is_enabled: boolean;
  redirect_uri?: string;
  created_at: Date;
  updated_at: Date;
}

interface OAuthProviderCardProps {
  provider: OAuthProvider;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

const providerIcons: Record<string, string> = {
  google: "🔵",
  github: "⚫",
  facebook: "🔷",
  twitter: "🐦",
  linkedin: "💼",
};

export function OAuthProviderCard({
  provider,
  onEdit,
  onDelete,
  onToggle,
}: OAuthProviderCardProps) {
  return (
    <Card.Root>
      <Card.Header pb={2}>
        <HStack justify="space-between">
          <HStack gap={3}>
            <Text fontSize="2xl">
              {providerIcons[provider.provider_name] || "🔐"}
            </Text>
            <Box>
              <Heading size="sm">{provider.display_name}</Heading>
              <Text fontSize="xs" color="gray.500">
                {provider.provider_name}
              </Text>
            </Box>
          </HStack>
          <Badge colorPalette={provider.is_enabled ? "green" : "gray"}>
            {provider.is_enabled ? "Active" : "Inactive"}
          </Badge>
        </HStack>
      </Card.Header>

      <Card.Body pt={2}>
        <VStack align="stretch" gap={3}>
          <Box>
            <Text fontSize="xs" color="gray.500" mb={1}>
              Client ID
            </Text>
            <Text fontSize="sm" noOfLines={1}>
              {provider.client_id}
            </Text>
          </Box>

          {provider.redirect_uri && (
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Redirect URI
              </Text>
              <Text fontSize="sm" noOfLines={1}>
                {provider.redirect_uri}
              </Text>
            </Box>
          )}

          <HStack
            justify="space-between"
            pt={2}
            borderTop="1px"
            borderColor="gray.200"
          >
            <HStack gap={2}>
              <Tooltip.Root content="Edit provider">
                <IconButton
                  aria-label="Edit"
                  size="sm"
                  variant="ghost"
                  onClick={onEdit}
                ><LuPencil /></IconButton>
              </Tooltip.Root>
              <Tooltip.Root content="Delete provider">
                <IconButton
                  aria-label="Delete"
                  size="sm"
                  variant="ghost"
                  colorPalette="red"
                  onClick={onDelete}
                ><LuTrash2 /></IconButton>
              </Tooltip.Root>
            </HStack>

            <HStack gap={2}>
              <Text fontSize="sm">Enable</Text>
              <Switch.Root
                checked={provider.is_enabled}
                onChange={onToggle}
                colorPalette="green"
              />
            </HStack>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
