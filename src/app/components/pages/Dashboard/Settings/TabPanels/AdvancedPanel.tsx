import { VStack, Box, Button } from "@chakra-ui/react";
import { SiteSettings } from "@/types";
import { SettingField } from "../components/SettingField";
import { groupSettingsByFolder } from "../utils";

interface AdvancedPanelProps {
  settings: SiteSettings;
  handleInputChange: (key: string, value: string) => void;
  handleToggle: (key: string) => void;
}

export const AdvancedPanel = ({
  settings,
  handleInputChange,
  handleToggle,
}: AdvancedPanelProps) => {
  const groupedSettings = groupSettingsByFolder(settings);
  const advancedSettings = groupedSettings["advanced"] || [];

  return (
    <VStack spacing={6} align="stretch">
      {advancedSettings.map((setting) => (
        <SettingField
          key={setting.key}
          setting={setting}
          handleInputChange={handleInputChange}
          handleToggle={handleToggle}
        />
      ))}
      <Box>
        <Button colorScheme="red" variant="outline">
          Clear Cache
        </Button>
      </Box>
    </VStack>
  );
};
