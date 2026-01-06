"use client";

import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Heading,
    Text,
    HStack,
    IconButton,
    Badge,
    Switch,
    VStack,
    Tooltip,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";

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
        <Card>
            <CardHeader pb={2}>
                <HStack justify="space-between">
                    <HStack spacing={3}>
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
                    <Badge colorScheme={provider.is_enabled ? "green" : "gray"}>
                        {provider.is_enabled ? "Active" : "Inactive"}
                    </Badge>
                </HStack>
            </CardHeader>

            <CardBody pt={2}>
                <VStack align="stretch" spacing={3}>
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

                    <HStack justify="space-between" pt={2} borderTop="1px" borderColor="gray.200">
                        <HStack spacing={2}>
                            <Tooltip label="Edit provider">
                                <IconButton
                                    aria-label="Edit"
                                    icon={<EditIcon />}
                                    size="sm"
                                    variant="ghost"
                                    onClick={onEdit}
                                />
                            </Tooltip>
                            <Tooltip label="Delete provider">
                                <IconButton
                                    aria-label="Delete"
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={onDelete}
                                />
                            </Tooltip>
                        </HStack>

                        <HStack spacing={2}>
                            <Text fontSize="sm">Enable</Text>
                            <Switch
                                isChecked={provider.is_enabled}
                                onChange={onToggle}
                                colorScheme="green"
                            />
                        </HStack>
                    </HStack>
                </VStack>
            </CardBody>
        </Card>
    );
}
