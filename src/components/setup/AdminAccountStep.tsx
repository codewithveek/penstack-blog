"use client";

import { useState } from "react";
import {
    VStack,
    FormControl,
    FormLabel,
    Input,
    Button,
    FormErrorMessage,
    InputGroup,
    InputRightElement,
    IconButton,
    Text,
    Box,
    HStack,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

interface AdminAccountStepProps {
    onNext: (data: { admin: any }) => void;
    onBack: () => void;
    initialData?: any;
}

export function AdminAccountStep({ onNext, onBack, initialData }: AdminAccountStepProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        password: initialData?.password || "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<any>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const newErrors: any = {};

        if (!formData.name || formData.name.length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = "Invalid email address";
        }

        if (!formData.password || formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (formData.password && !passwordRegex.test(formData.password)) {
            newErrors.password =
                "Password must contain uppercase, lowercase, and number";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onNext({
                admin: {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                },
            });
        }
    };

    const getPasswordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: "", color: "gray" };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 2) return { strength: 33, label: "Weak", color: "red" };
        if (strength <= 4) return { strength: 66, label: "Medium", color: "yellow" };
        return { strength: 100, label: "Strong", color: "green" };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <VStack spacing={6} align="stretch">
            <Text color="gray.600">
                Create your administrator account to manage your blog.
            </Text>

            <FormControl isInvalid={!!errors.name}>
                <FormLabel>Full Name</FormLabel>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email Address</FormLabel>
                <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Enter a strong password"
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
                {formData.password && (
                    <Box mt={2}>
                        <HStack spacing={2} mb={1}>
                            <Box flex={1} h="4px" bg="gray.200" borderRadius="full">
                                <Box
                                    h="100%"
                                    w={`${passwordStrength.strength}%`}
                                    bg={`${passwordStrength.color}.500`}
                                    borderRadius="full"
                                    transition="all 0.3s"
                                />
                            </Box>
                            <Text fontSize="sm" color={`${passwordStrength.color}.500`}>
                                {passwordStrength.label}
                            </Text>
                        </HStack>
                    </Box>
                )}
                <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                            setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        placeholder="Re-enter your password"
                    />
                    <InputRightElement>
                        <IconButton
                            aria-label="Toggle confirm password visibility"
                            icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            variant="ghost"
                            size="sm"
                        />
                    </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
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
