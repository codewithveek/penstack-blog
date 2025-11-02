import {
  VStack,
  HStack,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormHelperText,
  Image,
  Switch,
  Stack,
} from "@chakra-ui/react";
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
    <VStack spacing={6} align="stretch">
      <FormControl>
        <FormLabel>Site Name</FormLabel>
        <Input
          maxW={600}
          rounded="md"
          value={settings.siteName.value}
          onChange={(e) => handleInputChange("siteName", e.target.value)}
          placeholder="My Awesome Blog"
        />
      </FormControl>
      <FormControl>
        <FormLabel>Site Title</FormLabel>
        <FormHelperText>
          {settings.siteTitle?.description ||
            "The title of the site displayed in the browser and search engines"}
        </FormHelperText>
        <Input
          maxW={600}
          rounded="md"
          value={settings.siteTitle?.value}
          onChange={(e) => handleInputChange("siteTitle", e.target.value)}
          placeholder="My Awesome Blog Title"
        />
      </FormControl>
      <FormControl>
        <FormLabel>Site Description</FormLabel>
        <Textarea
          maxH={110}
          maxW={600}
          rounded="md"
          value={settings.siteDescription.value}
          onChange={(e) => handleInputChange("siteDescription", e.target.value)}
          placeholder="A brief description of your site"
        />
      </FormControl>
      <HStack gap={8} flexWrap="wrap">
        <Stack alignSelf={"stretch"}>
          <FormControl flex={1} display={"flex"} flexDirection={"column"}>
            <FormLabel>Site Favicon</FormLabel>
            <FormHelperText mt={0}>Recommended size 32x32</FormHelperText>
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
                    colorScheme="red"
                    variant={"ghost"}
                    onClick={() => handleInputChange("siteFavicon", "")}
                  >
                    Remove
                  </Button>
                )}
              </HStack>
            </Stack>
          </FormControl>
        </Stack>
        <Box>
          <FormControl>
            <FormLabel>Site Mobile Logo</FormLabel>
            <FormHelperText>Recommended size 300x300</FormHelperText>
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
                  colorScheme="red"
                  variant={"ghost"}
                  onClick={() => handleInputChange("siteLogoMobile", "")}
                >
                  Remove
                </Button>
              )}
            </HStack>
          </FormControl>
        </Box>
        <Box>
          <FormControl>
            <FormLabel>Site Logo</FormLabel>
            <FormHelperText>Recommended size 650x250</FormHelperText>
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
                  colorScheme="red"
                  variant={"ghost"}
                  onClick={() => handleInputChange("siteLogo", "")}
                >
                  Remove
                </Button>
              )}
            </HStack>
          </FormControl>
        </Box>
      </HStack>
      <Box mt={4}>
        <FormControl>
          <FormLabel>Site Opengraph Image</FormLabel>
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
                colorScheme="red"
                variant={"ghost"}
                onClick={() => handleInputChange("siteOpengraph", "")}
              >
                Remove
              </Button>
            )}
          </HStack>
        </FormControl>
      </Box>
      <Stack>
        {generalSettings
          .filter(
            (setting) =>
              setting.key.startsWith("show") ||
              setting.key === "maintenanceMode"
          )
          .map((setting) => (
            <FormControl key={setting.key} display="flex" alignItems="center">
              <FormLabel mb={0}>{setting.name}</FormLabel>
              <Switch
                isChecked={setting.enabled}
                onChange={() => handleToggle(setting.key)}
              />
            </FormControl>
          ))}
      </Stack>
    </VStack>
  );
};
