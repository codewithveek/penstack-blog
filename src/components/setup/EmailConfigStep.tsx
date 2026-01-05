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
    Select,
    Checkbox,
    Box,
    InputGroup,
    InputRightElement,
    IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

interface EmailConfigStepProps {
    onNext: (data: { email?: any }) => void;
    onBack: () => void;
    initialData?: any;
}

export function EmailConfigStep({
    onNext,
    onBack,
    initialData,
}: EmailConfigStepProps) {
    const [skip, setSkip] = useState(false);
    const [formData, setFormData] = useState({
        serviceType: initialData?.serviceType || "none",
        apiKey: initialData?.apiKey || "",
        smtpHost: initialData?.smtpHost || "",
        smtpPort: initialData?.smtpPort || 587,
        smtpUser: initialData?.smtpUser || "",
        smtpPassword: initialData?.smtpPassword || "",
        smtpSecure: initialData?.smtpSecure ?? true,
        fromEmail: initialData?.fromEmail || "",
        fromName: initialData?.fromName || "",
    });
    const [errors, setErrors] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);

    const validateForm = () => {
        if (skip || formData.serviceType === "none") return true;

        const newErrors: any = {};

        if (!formData.fromEmail || !isValidEmail(formData.fromEmail)) {
            newErrors.fromEmail = "Valid from email is required";
        }

        if (!formData.fromName) {
            newErrors.fromName = "From name is required";
        }

        if (formData.serviceType === "smtp") {
            if (!formData.smtpHost) newErrors.smtpHost = "SMTP host is required";
            if (!formData.smtpPort) newErrors.smtpPort = "SMTP port is required";
            if (!formData.smtpUser) newErrors.smtpUser = "SMTP user is required";
            if (!formData.smtpPassword)
                newErrors.smtpPassword = "SMTP password is required";
        } else if (
            ["resend", "sendgrid", "mailgun"].includes(formData.serviceType)
        ) {
            if (!formData.apiKey) newErrors.apiKey = "API key is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = () => {
        if (validateForm()) {
            if (skip || formData.serviceType === "none") {
                onNext({ email: undefined });
            } else {
                onNext({
                    email: {
                        serviceType: formData.serviceType,
                        apiKey: formData.apiKey || undefined,
                        smtpHost: formData.smtpHost || undefined,
                        smtpPort: formData.smtpPort || undefined,
                        smtpUser: formData.smtpUser || undefined,
                        smtpPassword: formData.smtpPassword || undefined,
                        smtpSecure: formData.smtpSecure,
                        fromEmail: formData.fromEmail,
                        fromName: formData.fromName,
                    },
                });
            }
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <Text color="gray.600">
                Configure email service for sending newsletters and notifications. This
                step is optional.
            </Text>

            <Checkbox
                isChecked={skip}
                onChange={(e) => setSkip(e.target.checked)}
                colorScheme="blue"
            >
                Skip email configuration (set up later)
            </Checkbox>

            {!skip && (
                <>
                    <FormControl>
                        <FormLabel>Email Service</FormLabel>
                        <Select
                            value={formData.serviceType}
                            onChange={(e) =>
                                setFormData({ ...formData, serviceType: e.target.value })
                            }
                        >
                            <option value="none">None (Skip)</option>
                            <option value="resend">Resend</option>
                            <option value="sendgrid">SendGrid</option>
                            <option value="mailgun">Mailgun</option>
                            <option value="smtp">Custom SMTP</option>
                        </Select>
                        <FormHelperText>
                            Choose your preferred email service provider
                        </FormHelperText>
                    </FormControl>

                    {formData.serviceType !== "none" && (
                        <>
                            {["resend", "sendgrid", "mailgun"].includes(
                                formData.serviceType
                            ) && (
                                    <FormControl isInvalid={!!errors.apiKey} isRequired>
                                        <FormLabel>API Key</FormLabel>
                                        <Input
                                            type="password"
                                            value={formData.apiKey}
                                            onChange={(e) =>
                                                setFormData({ ...formData, apiKey: e.target.value })
                                            }
                                            placeholder={`Enter your ${formData.serviceType} API key`}
                                        />
                                        <FormErrorMessage>{errors.apiKey}</FormErrorMessage>
                                    </FormControl>
                                )}

                            {formData.serviceType === "smtp" && (
                                <>
                                    <FormControl isInvalid={!!errors.smtpHost} isRequired>
                                        <FormLabel>SMTP Host</FormLabel>
                                        <Input
                                            value={formData.smtpHost}
                                            onChange={(e) =>
                                                setFormData({ ...formData, smtpHost: e.target.value })
                                            }
                                            placeholder="smtp.example.com"
                                        />
                                        <FormErrorMessage>{errors.smtpHost}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.smtpPort} isRequired>
                                        <FormLabel>SMTP Port</FormLabel>
                                        <Input
                                            type="number"
                                            value={formData.smtpPort}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    smtpPort: parseInt(e.target.value),
                                                })
                                            }
                                            placeholder="587"
                                        />
                                        <FormHelperText>
                                            Common ports: 587 (TLS), 465 (SSL), 25 (unsecured)
                                        </FormHelperText>
                                        <FormErrorMessage>{errors.smtpPort}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.smtpUser} isRequired>
                                        <FormLabel>SMTP Username</FormLabel>
                                        <Input
                                            value={formData.smtpUser}
                                            onChange={(e) =>
                                                setFormData({ ...formData, smtpUser: e.target.value })
                                            }
                                            placeholder="user@example.com"
                                        />
                                        <FormErrorMessage>{errors.smtpUser}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl isInvalid={!!errors.smtpPassword} isRequired>
                                        <FormLabel>SMTP Password</FormLabel>
                                        <InputGroup>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.smtpPassword}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        smtpPassword: e.target.value,
                                                    })
                                                }
                                                placeholder="Enter SMTP password"
                                            />
                                            <InputRightElement>
                                                <IconButton
                                                    aria-label="Toggle password visibility"
                                                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                            </InputRightElement>
                                        </InputGroup>
                                        <FormErrorMessage>{errors.smtpPassword}</FormErrorMessage>
                                    </FormControl>

                                    <FormControl>
                                        <Checkbox
                                            isChecked={formData.smtpSecure}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    smtpSecure: e.target.checked,
                                                })
                                            }
                                        >
                                            Use secure connection (TLS/SSL)
                                        </Checkbox>
                                    </FormControl>
                                </>
                            )}

                            <Box borderTop="1px" borderColor="gray.200" pt={4} mt={2}>
                                <Text fontWeight="semibold" mb={4}>
                                    Sender Information
                                </Text>

                                <FormControl isInvalid={!!errors.fromEmail} isRequired>
                                    <FormLabel>From Email</FormLabel>
                                    <Input
                                        type="email"
                                        value={formData.fromEmail}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fromEmail: e.target.value })
                                        }
                                        placeholder="noreply@example.com"
                                    />
                                    <FormHelperText>
                                        Email address that will appear as sender
                                    </FormHelperText>
                                    <FormErrorMessage>{errors.fromEmail}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={!!errors.fromName} isRequired>
                                    <FormLabel>From Name</FormLabel>
                                    <Input
                                        value={formData.fromName}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fromName: e.target.value })
                                        }
                                        placeholder="My Blog"
                                    />
                                    <FormHelperText>
                                        Name that will appear as sender
                                    </FormHelperText>
                                    <FormErrorMessage>{errors.fromName}</FormErrorMessage>
                                </FormControl>
                            </Box>
                        </>
                    )}
                </>
            )}

            <HStack spacing={4} pt={4}>
                <Button onClick={onBack} variant="outline" flex={1}>
                    Back
                </Button>
                <Button onClick={handleSubmit} colorScheme="blue" flex={1}>
                    Finish Setup
                </Button>
            </HStack>
        </VStack>
    );
}
