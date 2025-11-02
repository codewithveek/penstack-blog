import { VStack } from "@chakra-ui/react";
import { SiteSettings } from "@/types";
import { SettingField } from "../components/SettingField";
import { groupSettingsByFolder } from "../utils";

interface MediaPanelProps {
  settings: SiteSettings;
  handleInputChange: (key: string, value: string) => void;
  handleToggle: (key: string) => void;
}

export const MediaPanel = ({
  settings,
  handleInputChange,
  handleToggle,
}: MediaPanelProps) => {
  const groupedSettings = groupSettingsByFolder(settings);
  const mediaSettings = groupedSettings["media"] || [];

  return (
    <VStack spacing={6} align="stretch">
      {mediaSettings.map((setting) => (
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
