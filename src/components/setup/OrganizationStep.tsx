"use client";

import { VStack, Field, Input, Button, Text, HStack, Textarea, Checkbox } from "@chakra-ui/react";

import { useState } from "react";


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
        <VStack gap={6} align="stretch">
            <Text color="gray.600">
                Add organization details for structured data and SEO. This step is optional.
            </Text>

            <Checkbox.Root
                checked={skip}
                onChange={(e) => setSkip(e.target.checked)}
                colorPalette="blue"
            >
                Skip this step
            </Checkbox.Root>

            {!skip && (
                <>
                    <Field.Root>
                        <Field.Label>Organization Name</Field.Label>
                        <Input
                            value={formData.organizationName}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationName: e.target.value })
                            }
                            placeholder="Acme Corporation"
                        />
                        <Field.HelperText>Legal name of your organization</Field.HelperText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.organizationUrl}>
                        <Field.Label>Organization Website</Field.Label>
                        <Input
                            value={formData.organizationUrl}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationUrl: e.target.value })
                            }
                            placeholder="https://example.com"
                        />
                        <Field.ErrorText>{errors.organizationUrl}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.organizationEmail}>
                        <Field.Label>Contact Email</Field.Label>
                        <Input
                            type="email"
                            value={formData.organizationEmail}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationEmail: e.target.value })
                            }
                            placeholder="contact@example.com"
                        />
                        <Field.ErrorText>{errors.organizationEmail}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Phone Number</Field.Label>
                        <Input
                            value={formData.organizationPhone}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationPhone: e.target.value })
                            }
                            placeholder="+1 (555) 123-4567"
                        />
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Address</Field.Label>
                        <Textarea
                            value={formData.organizationAddress}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationAddress: e.target.value })
                            }
                            placeholder="123 Main St, City, State, ZIP, Country"
                            rows={3}
                        />
                        <Field.HelperText>Full postal address (JSON format supported)</Field.HelperText>
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Founder Name</Field.Label>
                        <Input
                            value={formData.organizationFounder}
                            onChange={(e) =>
                                setFormData({ ...formData, organizationFounder: e.target.value })
                            }
                            placeholder="John Doe"
                        />
                    </Field.Root>

                    <Field.Root>
                        <Field.Label>Founding Date</Field.Label>
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
                    </Field.Root>
                </>
            )}

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
