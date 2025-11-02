import {
  FormControl,
  FormLabel,
  Input,
  Switch,
  HStack,
  FormHelperText,
  Text,
  InputGroup,
  InputRightElement,
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
    <FormControl key={setting.key}>
      <FormLabel>{setting.name || setting.key}</FormLabel>
      {setting.hasOwnProperty("enabled") && (
        <HStack mb={1}>
          <Text>{setting.enabled ? "Enabled" : "Disabled"}</Text>
          <Switch
            isDisabled={!setting.value && setting.key !== "localPostAnalytics"}
            isChecked={setting.enabled}
            onChange={() => handleToggle(setting.key)}
          />
        </HStack>
      )}
      {setting.key !== "localPostAnalytics" && (
        <InputGroup>
          <Input
            maxW={600}
            rounded="md"
            type={setting.encrypted && !showPassword ? "password" : "text"}
            value={setting.value || ""}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            placeholder={setting.description}
          />
          {setting.encrypted && (
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? "Hide password" : "Show password"}
                icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
              />
            </InputRightElement>
          )}
        </InputGroup>
      )}
      {setting.canEncrypt && (
        <FormHelperText>
          This field can be encrypted for additional security
        </FormHelperText>
      )}
      {setting.description && !setting.canEncrypt && (
        <FormHelperText>{setting.description}</FormHelperText>
      )}
    </FormControl>
  );
};
