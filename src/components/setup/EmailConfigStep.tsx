"use client";

import {
  VStack,
  Field,
  Input,
  Button,
  Text,
  HStack,
  NativeSelect,
  Checkbox,
  Box,
  Group,
  InputElement,
  IconButton,
} from "@chakra-ui/react";

import { useState } from "react";

import { LuEye, LuEyeOff } from "react-icons/lu";

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
    <VStack gap={6} align="stretch">
      <Text color="gray.600">
        Configure email service for sending newsletters and notifications. This
        step is optional.
      </Text>

      <Checkbox.Root
        checked={skip}
        onChange={(e) => setSkip(e.target.checked)}
        colorPalette="blue"
      >
        Skip email configuration (set up later)
      </Checkbox.Root>

      {!skip && (
        <>
          <Field.Root>
            <Field.Label>Email Service</Field.Label>
            <NativeSelect.Root
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
            </NativeSelect.Root>
            <Field.HelperText>
              Choose your preferred email service provider
            </Field.HelperText>
          </Field.Root>

          {formData.serviceType !== "none" && (
            <>
              {["resend", "sendgrid", "mailgun"].includes(
                formData.serviceType
              ) && (
                <Field.Root invalid={!!errors.apiKey} required>
                  <Field.Label>API Key</Field.Label>
                  <Input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) =>
                      setFormData({ ...formData, apiKey: e.target.value })
                    }
                    placeholder={`Enter your ${formData.serviceType} API key`}
                  />
                  <Field.ErrorText>{errors.apiKey}</Field.ErrorText>
                </Field.Root>
              )}

              {formData.serviceType === "smtp" && (
                <>
                  <Field.Root invalid={!!errors.smtpHost} required>
                    <Field.Label>SMTP Host</Field.Label>
                    <Input
                      value={formData.smtpHost}
                      onChange={(e) =>
                        setFormData({ ...formData, smtpHost: e.target.value })
                      }
                      placeholder="smtp.example.com"
                    />
                    <Field.ErrorText>{errors.smtpHost}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.smtpPort} required>
                    <Field.Label>SMTP Port</Field.Label>
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
                    <Field.HelperText>
                      Common ports: 587 (TLS), 465 (SSL), 25 (unsecured)
                    </Field.HelperText>
                    <Field.ErrorText>{errors.smtpPort}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.smtpUser} required>
                    <Field.Label>SMTP Username</Field.Label>
                    <Input
                      value={formData.smtpUser}
                      onChange={(e) =>
                        setFormData({ ...formData, smtpUser: e.target.value })
                      }
                      placeholder="user@example.com"
                    />
                    <Field.ErrorText>{errors.smtpUser}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.smtpPassword} required>
                    <Field.Label>SMTP Password</Field.Label>
                    <Group>
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
                      <InputElement placement="end">
                        <IconButton
                          aria-label="Toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          variant="ghost"
                          size="sm"
                        >
                          {showPassword ? <LuEyeOff /> : <LuEye />}
                        </IconButton>
                      </InputElement>
                    </Group>
                    <Field.ErrorText>{errors.smtpPassword}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root>
                    <Checkbox.Root
                      checked={formData.smtpSecure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          smtpSecure: e.target.checked,
                        })
                      }
                    >
                      Use secure connection (TLS/SSL)
                    </Checkbox.Root>
                  </Field.Root>
                </>
              )}

              <Box borderTop="1px" borderColor="gray.200" pt={4} mt={2}>
                <Text fontWeight="semibold" mb={4}>
                  Sender Information
                </Text>

                <Field.Root invalid={!!errors.fromEmail} required>
                  <Field.Label>From Email</Field.Label>
                  <Input
                    type="email"
                    value={formData.fromEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, fromEmail: e.target.value })
                    }
                    placeholder="noreply@example.com"
                  />
                  <Field.HelperText>
                    Email address that will appear as sender
                  </Field.HelperText>
                  <Field.ErrorText>{errors.fromEmail}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.fromName} required>
                  <Field.Label>From Name</Field.Label>
                  <Input
                    value={formData.fromName}
                    onChange={(e) =>
                      setFormData({ ...formData, fromName: e.target.value })
                    }
                    placeholder="My Blog"
                  />
                  <Field.HelperText>
                    Name that will appear as sender
                  </Field.HelperText>
                  <Field.ErrorText>{errors.fromName}</Field.ErrorText>
                </Field.Root>
              </Box>
            </>
          )}
        </>
      )}

      <HStack gap={4} pt={4}>
        <Button onClick={onBack} variant="outline" flex={1}>
          Back
        </Button>
        <Button onClick={handleSubmit} colorPalette="blue" flex={1}>
          Finish Setup
        </Button>
      </HStack>
    </VStack>
  );
}
