"use client";

import { useState } from "react";
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    FormErrorMessage,
    Text,
    HStack,
    FormHelperText,
    Textarea,
    Checkbox,
} from "@chakra-ui/react";

interface OrganizationStepProps {
    onNext: (data: { organization?: any }) => void;
    onBack: () => void;
    initialData?: any;
}

export function OrganizationStep({
    onNext,
    onBack,
    initialData,
}: OrganizationStepProps) {
    const [skip, setSkip] = useState(false);
    const [formData, setFormData] = useState({
        organizationName: initialData?.organizationName || "",
        organizationUrl: initialData?.organizationUrl || "",
        organizationEmail: initialData?.organizationEmail || "",
        organizationPhone: initialData?.organizationPhone || "",
        organizationAddress: initialData?.organizationAddress || "",
        organizationFounder: initialData?.organizationFounder || "",
        organizationFoundingDate: initialData?.organizationFoundingDate || "",
    });
    const [errors, setErrors] = useState<any>({});

    const validateForm = () => {
        if (skip) return true;

        const newErrors: any = {};

        if (formData.organizationUrl && !isValidUrl(formData.organizationUrl)) {
            newErrors.organizationUrl = "Invalid URL";
        }

        if (formData.organizationEmail && !isValidEmail(formData.organizationEmail)) {
            newErrors.organizationEmail = "Invalid email address";
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

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = () => {
        if (validateForm()) {
            if (skip) {
                onNext({ organization: undefined });
            } else {
                const hasData = Object.values(formData).some((v) => v);
                onNext({
                    organization: hasData
                        ? {
                            organizationName: formData.organizationName || undefined,
                            organizationUrl: formData.organizationUrl || undefined,
                            organizationEmail: formData.organizationEmail || undefined,
                            organizationPhone: formData.organizationPhone || undefined,
                            organizationAddress: formData.organizationAddress || undefined,
                            organizationFounder: formData.organizationFounder || undefined,
                            organizationFoundingDate:
                                formData.organizationFoundingDate || undefined,
                        }
                        : undefined,
                });
            }
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <Text color="gray.600">
                Add organization details for structured data and SEO. This step is optional.
            </Text>

            <Checkbox
                isChecked={skip}
                onChange={(e) => setSkip(e.target.checked)}
                colorScheme="blue"
            >
                Skip this step
            </Checkbox>

            {!skip && (
                <>
                    <FormControl>
                        <FormLabel>Organization Name</FormLabel>
                        <Input
                            value={formData.organizationName}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationName: e.target.value })
                            }
                            placeholder="Acme Corporation"
                        />
                        <FormHelperText>Legal name of your organization</FormHelperText>
                    </FormControl>

                    <FormControl isInvalid={!!errors.organizationUrl}>
                        <FormLabel>Organization Website</FormLabel>
                        <Input
                            value={formData.organizationUrl}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationUrl: e.target.value })
                            }
                            placeholder="https://example.com"
                        />
                        <FormErrorMessage>{errors.organizationUrl}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={!!errors.organizationEmail}>
                        <FormLabel>Contact Email</FormLabel>
                        <Input
                            type="email"
                            value={formData.organizationEmail}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationEmail: e.target.value })
                            }
                            placeholder="contact@example.com"
                        />
                        <FormErrorMessage>{errors.organizationEmail}</FormErrorMessage>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Phone Number</FormLabel>
                        <Input
                            value={formData.organizationPhone}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationPhone: e.target.value })
                            }
                            placeholder="+1 (555) 123-4567"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Address</FormLabel>
                        <Textarea
                            value={formData.organizationAddress}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationAddress: e.target.value })
                            }
                            placeholder="123 Main St, City, State, ZIP, Country"
                            rows={3}
                        />
                        <FormHelperText>Full postal address (JSON format supported)</FormHelperText>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Founder Name</FormLabel>
                        <Input
                            value={formData.organizationFounder}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationFounder: e.target.value })
                            }
                            placeholder="John Doe"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Founding Date</FormLabel>
                        <Input
                            type="date"
                            value={formData.organizationFoundingDate}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    organizationFoundingDate: e.target.value,
                                })
                            }
                        />
                    </FormControl>
                </>
            )}

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
