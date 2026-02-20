"use client";

import { Box, Button, Container, Heading, VStack, HStack, Text, SimpleGrid } from "@chakra-ui/react";

import { useEffect, useState } from "react";

import { LuPlus } from "react-icons/lu";
import { OAuthProviderCard } from "@/components/Dashboard/Oauth/OAuthProviderCard";
import { OAuthProviderForm } from "@/components/Dashboard/Oauth/OAuthProviderForm";
import Loader from "@/components/Loader";
import { toaster } from "@/components/ui/toaster";

interface OAuthProvider {
  id: number;
  provider_name: string;
  display_name: string;
  client_id: string;
  is_enabled: boolean;
  redirect_uri?: string;
  scopes?: string;
  created_at: Date;
  updated_at: Date;
}

export default function OAuthProvidersPage() {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [selectedProvider, setSelectedProvider] =
    useState<OAuthProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  

  const fetchProviders = async () => {
    try {
      const response = await fetch("/api/oauth-providers");
      if (response.ok) {
        const data = await response.json();
        setProviders(data.data || []);
      }
    } catch (error) {
      toaster.create({
        title: "Error fetching providers",
        type: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleAdd = () => {
    setSelectedProvider(null);
    onOpen();
  };

  const handleEdit = (provider: OAuthProvider) => {
    setSelectedProvider(provider);
    onOpen();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    try {
      const response = await fetch(`/api/oauth-providers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toaster.create({
          title: "Provider deleted",
          type: "success",
          duration: 3000,
        });
        fetchProviders();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toaster.create({
        title: "Error deleting provider",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/oauth-providers/${id}/toggle`, {
        method: "POST",
      });

      if (response.ok) {
        toaster.create({
          title: `Provider ${currentStatus ? "disabled" : "enabled"}`,
          status: "success",
          duration: 3000,
        });
        fetchProviders();
      } else {
        throw new Error("Failed to toggle");
      }
    } catch (error) {
      toaster.create({
        title: "Error toggling provider",
        type: "error",
        duration: 3000,
      });
    }
  };

  const handleFormClose = (success?: boolean) => {
    onClose();
    if (success) {
      fetchProviders();
    }
  };

  return (
    <Box>
      <VStack gap={8} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="md">OAuth Providers</Heading>
            <Text color="gray.600" mt={2}>
              Manage OAuth authentication providers for your blog
            </Text>
          </Box>
          <Button size={"sm"} onClick={handleAdd}><LuPlus /> Add Provider</Button>
        </HStack>

        {loading ? (
          <Loader />
        ) : providers.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text color="gray.500" mb={4}>
              No OAuth providers configured yet
            </Text>
            <Button size={"sm"} onClick={handleAdd}>
              Add Your First Provider
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {providers.map((provider) => (
              <OAuthProviderCard
                key={provider.id}
                provider={provider}
                onEdit={() => handleEdit(provider)}
                onDelete={() => handleDelete(provider.id)}
                onToggle={() => handleToggle(provider.id, provider.is_enabled)}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>

      <OAuthProviderForm
        open={isOpen}
        onOpenChange={handleFormClose}
        provider={selectedProvider}
      />
    </Box>
  );
}
