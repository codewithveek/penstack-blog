// Chakra v3 card theme customization
// In v3, use defineSlotRecipe from @chakra-ui/react instead of styled-system helpers

export const CardConfig = {
  baseStyle: {
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
};

export const InputConfig = {
  baseStyle: {
    field: {
      focusBorderColor: "brand.500",
      _dark: {
        focusBorderColor: "brand.300",
      },
    },
  },
};
