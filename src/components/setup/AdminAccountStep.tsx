"use client";

import { VStack, Field, Input, Button, Group, InputElement, IconButton, Text, Box, HStack } from "@chakra-ui/react";

import { useState } from "react";

import { LuEye, LuEyeOff } from "react-icons/lu";

interface AdminAccountStepProps {
  onNext: (data: { admin: any }) => void;
  onBack: () => void;
  initialData?: any;
}

export function AdminAccountStep({
  onNext,
  onBack,
  initialData,
}: AdminAccountStepProps) {
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
    if (strength <= 4)
      return { strength: 66, label: "Medium", color: "yellow" };
    return { strength: 100, label: "Strong", color: "green" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <VStack gap={6} align="stretch">
      <Text color="gray.600">
        Create your administrator account to manage your blog.
      </Text>

      <Field.Root invalid={!!errors.name}>
        <Field.Label>Full Name</Field.Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
        />
        <Field.ErrorText>{errors.name}</Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.email}>
        <Field.Label>Email Address</Field.Label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="admin@example.com"
        />
        <Field.ErrorText>{errors.email}</Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.password}>
        <Field.Label>Password</Field.Label>
        <Group>
          <Input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Enter a strong password"
          />
          <InputElement placement="end">
            <IconButton
              aria-label="Toggle password visibility"
              icon={showPassword ? <LuEyeOff /> : <LuEye />}
              onClick={() => setShowPassword(!showPassword)}
              variant="ghost"
              size="sm"
            />
          </InputElement>
        </Group>
        {formData.password && (
          <Box mt={2}>
            <HStack gap={2} mb={1}>
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
        <Field.ErrorText>{errors.password}</Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.confirmPassword}>
        <Field.Label>Confirm Password</Field.Label>
        <Group>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="Re-enter your password"
          />
          <InputElement placement="end">
            <IconButton
              aria-label="Toggle confirm password visibility"
              icon={showConfirmPassword ? <LuEyeOff /> : <LuEye />}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              variant="ghost"
              size="sm"
            />
          </InputElement>
        </Group>
        <Field.ErrorText>{errors.confirmPassword}</Field.ErrorText>
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
