import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Switch,
  HStack,
} from "@chakra-ui/react";
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
    <VStack spacing={6} align="stretch">
      {socialSettings.map((setting) => (
        <FormControl key={setting.key}>
          <HStack justify="space-between" align="center">
            <FormLabel mb={0}>{setting.name || setting.key}</FormLabel>
            <Switch
              isChecked={setting.enabled}
              onChange={() => handleToggle(setting.key)}
            />
          </HStack>

          <Input
            value={setting.value || ""}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            isDisabled={!setting.enabled}
            placeholder={`Enter your ${setting.name.toLowerCase()} URL`}
          />
        </FormControl>
      ))}
    </VStack>
  );
};
