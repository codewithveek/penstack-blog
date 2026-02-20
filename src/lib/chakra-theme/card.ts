import { theme as baseTheme } from "@chakra-ui/react";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

// This function creates a set of function that helps us create multipart component styles.
const cardHelpers = createMultiStyleConfigHelpers(["container", "body"]);
const inputHelpers = createMultiStyleConfigHelpers(["field"]);

export const CardConfig = cardHelpers.defineMultiStyleConfig({
  baseStyle: {
    ...baseTheme.components.Card.baseStyle,
    container: {
      rounded: "xl",
      _light: {
        bg: "white",
      },
      _dark: {
        bg: "gray.800",
      },
    },
    body: {
      p: 4,
    },
  },

  variants: {
    outline: {
      container: {
        border: "1px solid",
        _light: {
          borderColor: "gray.300",
        },
        _dark: {
          borderColor: "gray.700",
        },
      },
    },
  },
});

const baseStyle = inputHelpers.definePartsStyle({
  field: {
    focusBorderColor: "brand.500",
    _dark: {
      focusBorderColor: "brand.300",
    },
  },
});

export const InputConfig = inputHelpers.defineMultiStyleConfig({ baseStyle });
