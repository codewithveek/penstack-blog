import { VStack, HStack, Box, Button, Field, Input, Textarea, Image, Switch, Stack } from "@chakra-ui/react";

import { SiteSettings } from "@/types";
import { groupSettingsByFolder } from "../utils";
import { SettingField } from "../components/SettingField";

interface GeneralPanelProps {
  settings: SiteSettings;
  handleInputChange: (key: string, value: string) => void;
  handleToggle: (key: string) => void;
  openMediaModal: (
    field: "siteLogo" | "siteLogoMobile" | "siteFavicon" | "siteOpengraph"
  ) => void;
}

export const GeneralPanel = ({
  settings,
  handleInputChange,
  handleToggle,
  openMediaModal,
}: GeneralPanelProps) => {
  const groupedSettings = groupSettingsByFolder(settings);
  const generalSettings = groupedSettings["general"] || [];

  return (
    <VStack gap={6} align="stretch">
      <Field.Root>
        <Field.Label>Site Name</Field.Label>
        <Input
          maxW={600}
          rounded="md"
          value={settings.siteName.value}
          onChange={(e) => handleInputChange("siteName", e.target.value)}
          placeholder="My Awesome Blog"
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Site Title</Field.Label>
        <Field.HelperText>
          {settings.siteTitle?.description ||
            "The title of the site displayed in the browser and search engines"}
        </Field.HelperText>
        <Input
          maxW={600}
          rounded="md"
          value={settings.siteTitle?.value}
          onChange={(e) => handleInputChange("siteTitle", e.target.value)}
          placeholder="My Awesome Blog Title"
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Site Description</Field.Label>
        <Textarea
          maxH={110}
          maxW={600}
          rounded="md"
          value={settings.siteDescription.value}
          onChange={(e) => handleInputChange("siteDescription", e.target.value)}
          placeholder="A brief description of your site"
        />
      </Field.Root>
      <HStack gap={8} flexWrap="wrap">
        <Stack alignSelf={"stretch"}>
          <Field.Root flex={1} display={"flex"} flexDirection={"column"}>
            <Field.Label>Site Favicon</Field.Label>
            <Field.HelperText mt={0}>Recommended size 32x32</Field.HelperText>
            <Stack flex={1} justify={"flex-end"}>
              {settings.siteFavicon?.value && (
                <Box mb={2}>
                  <Image
                    src={settings.siteFavicon.value}
                    alt="Favicon"
                    maxH="60px"
                  />
                </Box>
              )}
              <HStack>
                <Button size="sm" onClick={() => openMediaModal("siteFavicon")}>
                  {settings.siteFavicon?.value
                    ? "Change Favicon"
                    : "Add Favicon"}
                </Button>
                {settings.siteFavicon?.value && (
                  <Button
                    size="sm"
                    colorPalette="red"
                    variant={"ghost"}
                    onClick={() => handleInputChange("siteFavicon", "")}
                  >
                    Remove
                  </Button>
                )}
              </HStack>
            </Stack>
          </Field.Root>
        </Stack>
        <Box>
          <Field.Root>
            <Field.Label>Site Mobile Logo</Field.Label>
            <Field.HelperText>Recommended size 300x300</Field.HelperText>
            {settings.siteLogoMobile?.value && (
              <Box mb={2} mt={1}>
                <Image
                  src={settings?.siteLogoMobile?.value}
                  alt="Site Mobile Logo"
                  maxH="100px"
                />
              </Box>
            )}
            <HStack>
              <Button
                size="sm"
                onClick={() => openMediaModal("siteLogoMobile")}
              >
                {settings?.siteLogoMobile?.value ? "Change Logo" : "Add Logo"}
              </Button>
              {settings?.siteLogoMobile?.value && (
                <Button
                  size="sm"
                  colorPalette="red"
                  variant={"ghost"}
                  onClick={() => handleInputChange("siteLogoMobile", "")}
                >
                  Remove
                </Button>
              )}
            </HStack>
          </Field.Root>
        </Box>
        <Box>
          <Field.Root>
            <Field.Label>Site Logo</Field.Label>
            <Field.HelperText>Recommended size 650x250</Field.HelperText>
            {settings.siteLogo?.value && (
              <Box mb={2} mt={1}>
                <Image
                  src={settings.siteLogo.value}
                  alt="Site Logo"
                  maxH="100px"
                />
              </Box>
            )}
            <HStack>
              <Button size="sm" onClick={() => openMediaModal("siteLogo")}>
                {settings.siteLogo?.value ? "Change Logo" : "Add Logo"}
              </Button>
              {settings.siteLogo?.value && (
                <Button
                  size="sm"
                  colorPalette="red"
                  variant={"ghost"}
                  onClick={() => handleInputChange("siteLogo", "")}
                >
                  Remove
                </Button>
              )}
            </HStack>
          </Field.Root>
        </Box>
      </HStack>
      <Box mt={4}>
        <Field.Root>
          <Field.Label>Site Opengraph Image</Field.Label>
          {settings.siteOpengraph?.value && (
            <Box mb={2}>
              <Image
                src={settings.siteOpengraph.value}
                alt="Opengraph"
                maxH="200px"
              />
            </Box>
          )}
          <HStack>
            <Button size="sm" onClick={() => openMediaModal("siteOpengraph")}>
              {settings.siteOpengraph?.value
                ? "Change Opengraph Image"
                : "Add Opengraph Image"}
            </Button>
            {settings.siteOpengraph?.value && (
              <Button
                size="sm"
                colorPalette="red"
                variant={"ghost"}
                onClick={() => handleInputChange("siteOpengraph", "")}
              >
                Remove
              </Button>
            )}
          </HStack>
        </Field.Root>
      </Box>
      <Stack>
        {generalSettings
          .filter(
            (setting) =>
              setting.key.startsWith("show") ||
              setting.key === "maintenanceMode"
          )
          .map((setting) => (
            <Field.Root key={setting.key} display="flex" alignItems="center">
              <Field.Label mb={0}>{setting.name}</Field.Label>
              <Switch.Root
                checked={setting.enabled}
                onChange={() => handleToggle(setting.key)}
              />
            </Field.Root>
          ))}
      </Stack>
    </VStack>
  );
};
