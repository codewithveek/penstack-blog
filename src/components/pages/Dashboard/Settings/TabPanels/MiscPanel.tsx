import { Field, VStack, Input, Switch, HStack, Group, InputElement, IconButton } from "@chakra-ui/react";
import { SiteSettings } from "@/types";

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
    <VStack gap={6} align="stretch">
      {miscSettings.map((setting) => (
        <Field.Root key={setting.key}>
          <HStack justify="space-between" align="center">
            <Field.Label mb={0}>{setting.name || setting.key}</Field.Label>
            <Switch.Root
              checked={setting.enabled}
              onChange={() => handleToggle(setting.key)}
            />
          </HStack>

          <Group>
            <Input
              value={setting.value || ""}
              type={
                setting.encrypted && !showPasswords[setting.key]
                  ? "password"
                  : "text"
              }
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              disabled={!setting.enabled}
              placeholder={setting.description}
            />
            {setting.encrypted && (
              <InputElement placement="end">
                <IconButton
                  aria-label={
                    showPasswords[setting.key]
                      ? "Hide password"
                      : "Show password"
                  }
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePasswordVisibility(setting.key)}
                >
                  {showPasswords[setting.key] ? <FaEyeSlash /> : <FaEye />}
                </IconButton>
              </InputElement>
            )}
          </Group>

          {setting.canEncrypt && (
            <Field.HelperText>
              This field can be encrypted for additional security
            </Field.HelperText>
          )}
          {setting.description && !setting.canEncrypt && (
            <Field.HelperText>{setting.description}</Field.HelperText>
          )}
        </Field.Root>
      ))}
    </VStack>
  );
}
