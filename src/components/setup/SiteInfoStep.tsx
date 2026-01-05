"use client";

import { useState } from "react";
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    FormErrorMessage,
    Text,
    HStack,
    FormHelperText,
} from "@chakra-ui/react";

interface SiteInfoStepProps {
    onNext: (data: { siteInfo: any }) => void;
    onBack: () => void;
    initialData?: any;
}

export function SiteInfoStep({ onNext, onBack, initialData }: SiteInfoStepProps) {
    const [formData, setFormData] = useState({
        siteName: initialData?.siteName || "",
        siteDescription: initialData?.siteDescription || "",
        siteTagline: initialData?.siteTagline || "",
        siteLogo: initialData?.siteLogo || "",
        timezone: initialData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.siteName || formData.siteName.length < 1) {
            newErrors.siteName = "Site name is required";
        }

        if (formData.siteLogo && !isValidUrl(formData.siteLogo)) {
            newErrors.siteLogo = "Invalid URL";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onNext({
                siteInfo: {
                    siteName: formData.siteName,
                    siteDescription: formData.siteDescription || undefined,
                    siteTagline: formData.siteTagline || undefined,
                    siteLogo: formData.siteLogo || undefined,
                    timezone: formData.timezone || undefined,
                },
            });
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <Text color="gray.600">
                Tell us about your blog. You can change these settings later.
            </Text>

            <FormControl isInvalid={!!errors.siteName} isRequired>
                <FormLabel>Site Name</FormLabel>
                <Input
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    placeholder="My Awesome Blog"
                />
                <FormErrorMessage>{errors.siteName}</FormErrorMessage>
            </FormControl>

            <FormControl>
                <FormLabel>Site Description</FormLabel>
                <Textarea
                    value={formData.siteDescription}
                    onChange={(e) =>
                        setFormData({ ...formData, siteDescription: e.target.value })
                    }
                    placeholder="A brief description of your blog"
                    rows={3}
                />
                <FormHelperText>Optional - Used for SEO and social sharing</FormHelperText>
            </FormControl>

            <FormControl>
                <FormLabel>Tagline</FormLabel>
                <Input
                    value={formData.siteTagline}
                    onChange={(e) =>
                        setFormData({ ...formData, siteTagline: e.target.value })
                    }
                    placeholder="Just another awesome blog"
                />
                <FormHelperText>Optional - A catchy phrase for your blog</FormHelperText>
            </FormControl>

            <FormControl isInvalid={!!errors.siteLogo}>
                <FormLabel>Logo URL</FormLabel>
                <Input
                    value={formData.siteLogo}
                    onChange={(e) => setFormData({ ...formData, siteLogo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                />
                <FormHelperText>Optional - URL to your logo image</FormHelperText>
                <FormErrorMessage>{errors.siteLogo}</FormErrorMessage>
            </FormControl>

            <FormControl>
                <FormLabel>Timezone</FormLabel>
                <Input
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    placeholder="UTC"
                />
                <FormHelperText>
                    Optional - Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </FormHelperText>
            </FormControl>

            <HStack spacing={4} pt={4}>
                <Button onClick={onBack} variant="outline" flex={1}>
                    Back
                </Button>
                <Button onClick={handleSubmit} colorScheme="blue" flex={1}>
                    Continue
                </Button>
            </HStack>
        </VStack>
    );
}
