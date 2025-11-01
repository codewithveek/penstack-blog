import { VStack } from "@chakra-ui/react";
import { SiteSettings } from "@/types";
import { SettingField } from "../components/SettingField";
import { groupSettingsByFolder } from "../utils";

interface EmailPanelProps {
  settings: SiteSettings;
  handleInputChange: (key: string, value: string) => void;
  handleToggle: (key: string) => void;
}

export const EmailPanel = ({
  settings,
  handleInputChange,
  handleToggle,
}: EmailPanelProps) => {
  const groupedSettings = groupSettingsByFolder(settings);
  const emailSettings = groupedSettings["email"] || [];

  return (
    <VStack spacing={6} align="stretch">
      {emailSettings.map((setting) => (
        <SettingField
          key={setting.key}
          setting={setting}
          handleInputChange={handleInputChange}
          handleToggle={handleToggle}
        />
      ))}
    </VStack>
  );
};
