import { VStack, Field, Input, Switch, HStack } from "@chakra-ui/react";

import { SiteSettings } from "@/types";
import { groupSettingsByFolder } from "../utils";

interface SocialPanelProps {
  settings: SiteSettings;
  handleInputChange: (key: string, value: string) => void;
  handleToggle: (key: string) => void;
}

export const SocialPanel = ({
  settings,
  handleInputChange,
  handleToggle,
}: SocialPanelProps) => {
  const groupedSettings = groupSettingsByFolder(settings);
  const socialSettings = groupedSettings["social"] || [];

  return (
    <VStack gap={6} align="stretch">
      {socialSettings.map((setting) => (
        <Field.Root key={setting.key}>
          <HStack justify="space-between" align="center">
            <Field.Label mb={0}>{setting.name || setting.key}</Field.Label>
            <Switch.Root
              checked={setting.enabled}
              onChange={() => handleToggle(setting.key)}
            />
          </HStack>

          <Input
            value={setting.value || ""}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={!setting.enabled}
            placeholder={`Enter your ${setting.name.toLowerCase()} URL`}
          />
        </Field.Root>
      ))}
    </VStack>
  );
};
