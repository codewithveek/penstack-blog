"use client";

import {
  Dialog,
  Button,
  Field,
  Input,
  NativeSelect,
  VStack,
  Group,
  InputElement,
  IconButton,
  Textarea,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";

import { LuEye, LuEyeOff } from "react-icons/lu";
import { toaster } from "@/components/ui/toaster";

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
  open: boolean;
  onOpenChange: (success?: boolean) => void;
  provider?: OAuthProvider | null;
}

export function OAuthProviderForm({
  open,
  onOpenChange,
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
  }, [provider, open]);

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
        toaster.create({
          title: provider ? "Provider updated" : "Provider created",
          type: "success",
          duration: 3000,
        });
        onOpenChange(true);
      } else {
        const error = await response.json();
        toaster.create({
          title: "Error",
          description: error.message || "Failed to save provider",
          type: "error",
          duration: 5000,
        });
      }
    } catch (error) {
      toaster.create({
        title: "Error",
        description: "An unexpected error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={() => onOpenChange()} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            {provider ? "Edit OAuth Provider" : "Add OAuth Provider"}
          </Dialog.Header>
          <Dialog.CloseTrigger />

          <Dialog.Body>
            <VStack gap={4}>
              <Field.Root invalid={!!errors.provider_name} required>
                <Field.Label>Provider</Field.Label>
                <NativeSelect.Root disabled={!!provider}>
                  <NativeSelect.Field
                    value={formData.provider_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        provider_name: e.target.value,
                      })
                    }
                  >
                    <option value="">Select provider</option>
                    <option value="google">Google</option>
                    <option value="github">GitHub</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
                <Field.ErrorText>{errors.provider_name}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.display_name} required>
                <Field.Label>Display Name</Field.Label>
                <Input
                  value={formData.display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, display_name: e.target.value })
                  }
                  placeholder="Google OAuth"
                />
                <Field.ErrorText>{errors.display_name}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.client_id} required>
                <Field.Label>Client ID</Field.Label>
                <Input
                  value={formData.client_id}
                  onChange={(e) =>
                    setFormData({ ...formData, client_id: e.target.value })
                  }
                  placeholder="Enter client ID"
                />
                <Field.ErrorText>{errors.client_id}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.client_secret} required={!provider}>
                <Field.Label>Client Secret</Field.Label>
                <Group>
                  <Input
                    type={showSecret ? "text" : "password"}
                    value={formData.client_secret}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        client_secret: e.target.value,
                      })
                    }
                    placeholder={
                      provider
                        ? "Leave blank to keep current"
                        : "Enter client secret"
                    }
                  />
                  <InputElement placement="end">
                    <IconButton
                      aria-label="Toggle secret visibility"
                      onClick={() => setShowSecret(!showSecret)}
                      variant="ghost"
                      size="sm"
                    >
                      {showSecret ? <LuEyeOff /> : <LuEye />}
                    </IconButton>
                  </InputElement>
                </Group>
                <Field.ErrorText>{errors.client_secret}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.redirect_uri}>
                <Field.Label>Redirect URI</Field.Label>
                <Input
                  value={formData.redirect_uri}
                  onChange={(e) =>
                    setFormData({ ...formData, redirect_uri: e.target.value })
                  }
                  placeholder="https://yourdomain.com/api/auth/callback/google"
                />
                <Field.HelperText>
                  Optional - Callback URL for OAuth flow
                </Field.HelperText>
                <Field.ErrorText>{errors.redirect_uri}</Field.ErrorText>
              </Field.Root>

              <Field.Root>
                <Field.Label>Scopes</Field.Label>
                <Textarea
                  value={formData.scopes}
                  onChange={(e) =>
                    setFormData({ ...formData, scopes: e.target.value })
                  }
                  placeholder="email, profile, openid"
                  rows={2}
                />
                <Field.HelperText>
                  Comma-separated list of OAuth scopes
                </Field.HelperText>
              </Field.Root>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <Button variant="ghost" mr={3} onClick={() => onOpenChange()}>
              Cancel
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              {provider ? "Update" : "Create"}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
