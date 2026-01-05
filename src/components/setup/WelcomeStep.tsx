"use client";

import {
    VStack,
    Heading,
    Text,
    Button,
    Box,
    Icon,
    List,
    ListItem,
    ListIcon,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

interface WelcomeStepProps {
    onNext: (data: any) => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <VStack spacing={8} align="stretch" py={4}>
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
                <List spacing={3}>
                    <ListItem>
                        <ListIcon as={CheckCircleIcon} color="green.500" />
                        Administrator account for managing your blog
                    </ListItem>
                    <ListItem>
                        <ListIcon as={CheckCircleIcon} color="green.500" />
                        Basic site information and branding
                    </ListItem>
                    <ListItem>
                        <ListIcon as={CheckCircleIcon} color="green.500" />
                        Organization details (optional)
                    </ListItem>
                    <ListItem>
                        <ListIcon as={CheckCircleIcon} color="green.500" />
                        Email service configuration (optional)
                    </ListItem>
                </List>
            </Box>

            <Box bg="blue.50" p={4} borderRadius="md">
                <Text fontSize="sm" color="blue.800">
                    <strong>Note:</strong> You can always change these settings later from
                    your dashboard.
                </Text>
            </Box>

            <Button onClick={() => onNext({})} colorScheme="blue" size="lg">
                Get Started
            </Button>
        </VStack>
    );
}
