import { SiteSettings } from "@/types";
import {
  FormLabel,
  VStack,
  FormControl,
  Input,
  Switch,
  FormHelperText,
  HStack,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { groupSettingsByFolder } from "../utils";

interface MiscPanelProps {
  settings: SiteSettings;
  handleInputChange: (key: string, value: string) => void;
  handleToggle: (key: string) => void;
}

export function MiscPanel({
  settings,
  handleInputChange,
  handleToggle,
}: MiscPanelProps) {
  const groupedSettings = groupSettingsByFolder(settings);
  const miscSettings = groupedSettings["misc"] || [];
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <VStack spacing={6} align="stretch">
      {miscSettings.map((setting) => (
        <FormControl key={setting.key}>
          <HStack justify="space-between" align="center">
            <FormLabel mb={0}>{setting.name || setting.key}</FormLabel>
            <Switch
              isChecked={setting.enabled}
              onChange={() => handleToggle(setting.key)}
            />
          </HStack>

          <InputGroup>
            <Input
              value={setting.value || ""}
              type={
                setting.encrypted && !showPasswords[setting.key]
                  ? "password"
                  : "text"
              }
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              isDisabled={!setting.enabled}
              placeholder={setting.description}
            />
            {setting.encrypted && (
              <InputRightElement>
                <IconButton
                  aria-label={
                    showPasswords[setting.key]
                      ? "Hide password"
                      : "Show password"
                  }
                  icon={showPasswords[setting.key] ? <FaEyeSlash /> : <FaEye />}
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePasswordVisibility(setting.key)}
                />
              </InputRightElement>
            )}
          </InputGroup>

          {setting.canEncrypt && (
            <FormHelperText>
              This field can be encrypted for additional security
            </FormHelperText>
          )}
          {setting.description && !setting.canEncrypt && (
            <FormHelperText>{setting.description}</FormHelperText>
          )}
        </FormControl>
      ))}
    </VStack>
  );
}
