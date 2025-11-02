import {
  Button,
  ButtonGroup,
  HStack,
  IconButton,
  LightMode,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { LuMoon, LuSun } from "react-icons/lu";

export const LightDarkModeSwitch = ({ showLabel }: { showLabel?: boolean }) => {
  const { colorMode, toggleColorMode, setColorMode } = useColorMode();

  const hoverBgColor = useColorModeValue("gray.100", "gray.700");
  return (
    <HStack>
      {!showLabel && (
        <IconButton
          aria-label="Toggle color mode"
          colorScheme="gray"
          icon={
            colorMode === "light" ? <LuMoon size={20} /> : <LuSun size={20} />
          }
          onClick={toggleColorMode}
          variant="ghost"
          _hover={{ bg: hoverBgColor }}
          rounded={"full"}
        />
      )}
      {showLabel && (
        <ButtonGroup size={"sm"} rounded={"lg"}>
          {["Light", "Dark"].map((mode, i) => (
            <Button
              key={i}
              colorScheme={colorMode === mode.toLowerCase() ? "brand" : "gray"}
              fontWeight={400}
              leftIcon={<LuSun size={16} />}
              onClick={() => setColorMode(mode.toLowerCase())}
              variant={colorMode === mode.toLowerCase() ? "solid" : "ghost"}
              rounded={"lg"}
            >
              {" "}
              <Text as="span">{mode}</Text>{" "}
            </Button>
          ))}
        </ButtonGroup>
      )}
    </HStack>
  );
};
