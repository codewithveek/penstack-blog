import { VStack, Button, useDisclosure } from "@chakra-ui/react";
import { SiteSettings } from "@/types";
import { SettingField } from "../components/SettingField";
import { groupSettingsByFolder } from "../utils";

interface MonitoringPanelProps {
  settings: SiteSettings;
  handleInputChange: (key: string, value: string) => void;
  handleToggle: (key: string) => void;
}

export const MonitoringPanel = ({
  settings,
  handleInputChange,
  handleToggle,
}: MonitoringPanelProps) => {
  const { isOpen, onToggle } = useDisclosure();
  const groupedSettings = groupSettingsByFolder(settings);
  const monitoringSettings = groupedSettings["monitoring"] || [];

  return (
    <VStack spacing={6} align="stretch">
      {monitoringSettings.map((setting) => (
        <SettingField
          key={setting.key}
          setting={setting}
          handleInputChange={handleInputChange}
          handleToggle={handleToggle}
        />
      ))}
      <Button onClick={onToggle} size="sm" variant="outline">
        {isOpen ? "Cancel" : "Add New Monitoring Setting"}
      </Button>
    </VStack>
  );
};
