import { VStack, Button, useDisclosure } from "@chakra-ui/react";
import React from "react";

import { SiteSettings } from "@/types";
import { SettingField } from "../components/SettingField";
import { groupSettingsByFolder } from "../utils";

interface AnalyticsPanelProps {
  settings: SiteSettings;
  handleInputChange: (key: string, value: string) => void;
  handleToggle: (key: string) => void;
}

export const AnalyticsPanel = ({
  settings,
  handleInputChange,
  handleToggle,
}: AnalyticsPanelProps) => {
  const { isOpen, onToggle } = useDisclosure();
  const groupedSettings = groupSettingsByFolder(settings);
  const analyticsSettings = groupedSettings["analytics"] || [];

  return (
    <VStack gap={6} align="stretch">
      {analyticsSettings.map((setting) => (
        <SettingField
          key={setting.key}
          setting={setting}
          handleInputChange={handleInputChange}
          handleToggle={handleToggle}
        />
      ))}
      <Button onClick={onToggle} size="sm" variant="outline">
        {isOpen ? "Cancel" : "Add New Analytics Setting"}
      </Button>
    </VStack>
  );
};
