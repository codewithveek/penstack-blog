"use client";

import { ChakraProvider } from "@chakra-ui/react";


import { system } from "@/lib/chakra-theme";
import { ThemeProvider } from "next-themes";

export function ChakraUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
