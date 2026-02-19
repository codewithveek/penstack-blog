import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'DM Sans Variable', sans-serif" },
        body: { value: "'DM Sans Variable', sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#e6f7ff" },
          100: { value: "#b3e0ff" },
          200: { value: "#80caff" },
          300: { value: "#4db3ff" },
          400: { value: "#1a9dff" },
          500: { value: "#0080e6" },
          600: { value: "#0066b3" },
          700: { value: "#004d80" },
          800: { value: "#00334d" },
          900: { value: "#001a1a" },
        },
        brandPurple: {
          50: { value: "#f0e5ff" },
          100: { value: "#d1b3ff" },
          200: { value: "#b380ff" },
          300: { value: "#944dff" },
          400: { value: "#751aff" },
          500: { value: "#5c00e6" },
          600: { value: "#4900b3" },
          700: { value: "#360080" },
          800: { value: "#24004d" },
          900: { value: "#12001a" },
        },
        brandBlue: {
          50: { value: "#e5f0ff" },
          100: { value: "#b3d1ff" },
          200: { value: "#80b3ff" },
          300: { value: "#4d94ff" },
          400: { value: "#1a75ff" },
          500: { value: "#2A6AE1" },
          600: { value: "#004db3" },
          700: { value: "#003980" },
          800: { value: "#00264d" },
          900: { value: "#00121a" },
        },
        charcoalBlack: { value: "#121212" },
        darkGray: { value: "#1a1a2e" },
      },
      sizes: {
        "max-w-content": { value: "1440px" },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: "{colors.brand.500}" },
          contrast: { value: "white" },
          fg: { value: "{colors.brand.700}" },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.50}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing: { value: "{colors.brand.500}" },
        },
      },
    },
  },
  globalCss: {
    html: {
      scrollBehavior: "smooth",
    },
    body: {
      fontFamily: "'DM Sans Variable', sans-serif",
    },
    "*": {
      scrollbarWidth: "thin",
    },
    "h1, h2, h3, h4, h5, h6": {
      fontWeight: 600,
    },
  },
});

export const system = createSystem(defaultConfig, config);
