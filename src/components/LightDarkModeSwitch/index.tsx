import { Button, ButtonGroup, HStack, IconButton, Text } from "@chakra-ui/react";
import { LightMode, useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { LuMoon, LuSun } from "react-icons/lu";

export const LightDarkModeSwitch = ({ showLabel }: { showLabel?: boolean }) => {
  const { colorMode, toggleColorMode, setColorMode } = useColorMode();

  const hoverBgColor = useColorModeValue("gray.100", "gray.700");
  return (
    <HStack>
      {!showLabel && (
        <IconButton
          aria-label="Toggle color mode"
          colorPalette="gray"
          onClick={toggleColorMode}
          variant="ghost"
          _hover={{ bg: hoverBgColor }}
          rounded={"full"}
        >
          {colorMode === "light" ? <LuMoon size={20} /> : <LuSun size={20} />}
        </IconButton>
      )}
      {showLabel && (
        <ButtonGroup size={"sm"} rounded={"lg"}>
          {["Light", "Dark"].map((mode, i) => (
            <Button
              key={i}
              colorPalette={colorMode === mode.toLowerCase() ? "brand" : "gray"}
              fontWeight={400}
              onClick={() => setColorMode(mode.toLowerCase())}
              variant={colorMode === mode.toLowerCase() ? "solid" : "ghost"}
              rounded={"lg"}
            >
              <LuSun size={16} />
              <Text as="span">{mode}</Text>
            </Button>
          ))}
        </ButtonGroup>
      )}
    </HStack>
  );
};
