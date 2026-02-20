import {
  Field,
  Input,
  Switch,
  HStack,
  Text,
  Group,
  InputElement,
  IconButton,
} from "@chakra-ui/react";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface SettingFieldProps {
  setting: any;
  handleInputChange: (key: string, value: string) => void;
  handleToggle: (key: string) => void;
}

export const SettingField = ({
  setting,
  handleInputChange,
  handleToggle,
}: SettingFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field.Root key={setting.key}>
      <Field.Label>{setting.name || setting.key}</Field.Label>
      {setting.hasOwnProperty("enabled") && (
        <HStack mb={1}>
          <Text>{setting.enabled ? "Enabled" : "Disabled"}</Text>
          <Switch.Root
            disabled={!setting.value && setting.key !== "localPostAnalytics"}
            checked={setting.enabled}
            onChange={() => handleToggle(setting.key)}
          />
        </HStack>
      )}
      {setting.key !== "localPostAnalytics" && (
        <Group>
          <Input
            maxW={600}
            rounded="md"
            type={setting.encrypted && !showPassword ? "password" : "text"}
            value={setting.value || ""}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            placeholder={setting.description}
          />
          {setting.encrypted && (
            <InputElement placement="end">
              <IconButton
                aria-label={showPassword ? "Hide password" : "Show password"}
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </IconButton>
            </InputElement>
          )}
        </Group>
      )}
      {setting.canEncrypt && (
        <Field.HelperText>
          This field can be encrypted for additional security
        </Field.HelperText>
      )}
      {setting.description && !setting.canEncrypt && (
        <Field.HelperText>{setting.description}</Field.HelperText>
      )}
    </Field.Root>
  );
};
