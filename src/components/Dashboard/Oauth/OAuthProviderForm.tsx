"use client";

import { useState, useEffect } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    FormErrorMessage,
    InputGroup,
    InputRightElement,
    IconButton,
    useToast,
    FormHelperText,
    Textarea,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

interface OAuthProvider {
    id: number;
    provider_name: string;
    display_name: string;
    client_id: string;
    is_enabled: boolean;
    redirect_uri?: string;
    scopes?: string;
}

interface OAuthProviderFormProps {
    isOpen: boolean;
    onClose: (success?: boolean) => void;
    provider?: OAuthProvider | null;
}

export function OAuthProviderForm({
    isOpen,
    onClose,
    provider,
}: OAuthProviderFormProps) {
    const [formData, setFormData] = useState({
        provider_name: "",
        display_name: "",
        client_id: "",
        client_secret: "",
        redirect_uri: "",
        scopes: "",
    });
    const [errors, setErrors] = useState<any>({});
    const [showSecret, setShowSecret] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (provider) {
            setFormData({
                provider_name: provider.provider_name,
                display_name: provider.display_name,
                client_id: provider.client_id,
                client_secret: "",
                redirect_uri: provider.redirect_uri || "",
                scopes: provider.scopes || "",
            });
        } else {
            setFormData({
                provider_name: "",
                display_name: "",
                client_id: "",
                client_secret: "",
                redirect_uri: "",
                scopes: "",
            });
        }
        setErrors({});
    }, [provider, isOpen]);

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.provider_name) {
            newErrors.provider_name = "Provider name is required";
        }

        if (!formData.display_name) {
            newErrors.display_name = "Display name is required";
        }

        if (!formData.client_id) {
            newErrors.client_id = "Client ID is required";
        }

        if (!provider && !formData.client_secret) {
            newErrors.client_secret = "Client secret is required";
        }

        if (formData.redirect_uri) {
            try {
                new URL(formData.redirect_uri);
            } catch {
                newErrors.redirect_uri = "Invalid URL";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const url = provider
                ? `/api/oauth-providers/${provider.id}`
                : "/api/oauth-providers";

            const method = provider ? "PATCH" : "POST";

            const body: any = {
                provider_name: formData.provider_name,
                display_name: formData.display_name,
                client_id: formData.client_id,
            };

            if (formData.client_secret) {
                body.client_secret = formData.client_secret;
            }

            if (formData.redirect_uri) {
                body.redirect_uri = formData.redirect_uri;
            }

            if (formData.scopes) {
                body.scopes = formData.scopes.split(",").map((s) => s.trim());
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                toast({
                    title: provider ? "Provider updated" : "Provider created",
                    status: "success",
                    duration: 3000,
                });
                onClose(true);
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.message || "Failed to save provider",
                    status: "error",
                    duration: 5000,
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => onClose()} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    {provider ? "Edit OAuth Provider" : "Add OAuth Provider"}
                </ModalHeader>
                <ModalCloseButton />

                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isInvalid={!!errors.provider_name} isRequired>
                            <FormLabel>Provider</FormLabel>
                            <Select
                                value={formData.provider_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, provider_name: e.target.value })
                                }
                                isDisabled={!!provider}
                            >
                                <option value="">Select provider</option>
                                <option value="google">Google</option>
                                <option value="github">GitHub</option>
                                <option value="facebook">Facebook</option>
                                <option value="twitter">Twitter</option>
                                <option value="linkedin">LinkedIn</option>
                            </Select>
                            <FormErrorMessage>{errors.provider_name}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.display_name} isRequired>
                            <FormLabel>Display Name</FormLabel>
                            <Input
                                value={formData.display_name}
                                onChange={(e) =>
                                    setFormData({ ...formData, display_name: e.target.value })
                                }
                                placeholder="Google OAuth"
                            />
                            <FormErrorMessage>{errors.display_name}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.client_id} isRequired>
                            <FormLabel>Client ID</FormLabel>
                            <Input
                                value={formData.client_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, client_id: e.target.value })
                                }
                                placeholder="Enter client ID"
                            />
                            <FormErrorMessage>{errors.client_id}</FormErrorMessage>
                        </FormControl>

                        <FormControl
                            isInvalid={!!errors.client_secret}
                            isRequired={!provider}
                        >
                            <FormLabel>Client Secret</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showSecret ? "text" : "password"}
                                    value={formData.client_secret}
                                    onChange={(e) =>
                                        setFormData({ ...formData, client_secret: e.target.value })
                                    }
                                    placeholder={
                                        provider ? "Leave blank to keep current" : "Enter client secret"
                                    }
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label="Toggle secret visibility"
                                        icon={showSecret ? <ViewOffIcon /> : <ViewIcon />}
                                        onClick={() => setShowSecret(!showSecret)}
                                        variant="ghost"
                                        size="sm"
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{errors.client_secret}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.redirect_uri}>
                            <FormLabel>Redirect URI</FormLabel>
                            <Input
                                value={formData.redirect_uri}
                                onChange={(e) =>
                                    setFormData({ ...formData, redirect_uri: e.target.value })
                                }
                                placeholder="https://yourdomain.com/api/auth/callback/google"
                            />
                            <FormHelperText>
                                Optional - Callback URL for OAuth flow
                            </FormHelperText>
                            <FormErrorMessage>{errors.redirect_uri}</FormErrorMessage>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Scopes</FormLabel>
                            <Textarea
                                value={formData.scopes}
                                onChange={(e) =>
                                    setFormData({ ...formData, scopes: e.target.value })
                                }
                                placeholder="email, profile, openid"
                                rows={2}
                            />
                            <FormHelperText>
                                Comma-separated list of OAuth scopes
                            </FormHelperText>
                        </FormControl>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={() => onClose()}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                    >
                        {provider ? "Update" : "Create"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
