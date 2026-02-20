"use client";

import { VStack, Field, Input, Textarea, Button, Text, HStack } from "@chakra-ui/react";

import { useState } from "react";


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
        <VStack gap={6} align="stretch">
            <Text color="gray.600">
                Tell us about your blog. You can change these settings later.
            </Text>

            <Field.Root invalid={!!errors.siteName} required>
                <Field.Label>Site Name</Field.Label>
                <Input
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    placeholder="My Awesome Blog"
                />
                <Field.ErrorText>{errors.siteName}</Field.ErrorText>
            </Field.Root>

            <Field.Root>
                <Field.Label>Site Description</Field.Label>
                <Textarea
                    value={formData.siteDescription}
                    onChange={(e) =>
                        setFormData({ ...formData, siteDescription: e.target.value })
                    }
                    placeholder="A brief description of your blog"
                    rows={3}
                />
                <Field.HelperText>Optional - Used for SEO and social sharing</Field.HelperText>
            </Field.Root>

            <Field.Root>
                <Field.Label>Tagline</Field.Label>
                <Input
                    value={formData.siteTagline}
                    onChange={(e) =>
                        setFormData({ ...formData, siteTagline: e.target.value })
                    }
                    placeholder="Just another awesome blog"
                />
                <Field.HelperText>Optional - A catchy phrase for your blog</Field.HelperText>
            </Field.Root>

            <Field.Root invalid={!!errors.siteLogo}>
                <Field.Label>Logo URL</Field.Label>
                <Input
                    value={formData.siteLogo}
                    onChange={(e) => setFormData({ ...formData, siteLogo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                />
                <Field.HelperText>Optional - URL to your logo image</Field.HelperText>
                <Field.ErrorText>{errors.siteLogo}</Field.ErrorText>
            </Field.Root>

            <Field.Root>
                <Field.Label>Timezone</Field.Label>
                <Input
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    placeholder="UTC"
                />
                <Field.HelperText>
                    Optional - Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </Field.HelperText>
            </Field.Root>

            <HStack gap={4} pt={4}>
                <Button onClick={onBack} variant="outline" flex={1}>
                    Back
                </Button>
                <Button onClick={handleSubmit} colorPalette="blue" flex={1}>
                    Continue
                </Button>
            </HStack>
        </VStack>
    );
}
