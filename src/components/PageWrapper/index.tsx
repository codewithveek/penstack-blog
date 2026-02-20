"use client";

import { Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import Header from "../Header";
import Footer from "../Footer";

import NetworkAvailabiltyCheck from "../NetworkAvailabiltyCheck";
import { useColorModeValue } from "@/components/ui/color-mode";

export default function PageWrapper({
  children,
  styleProps,
  pt = "60px",
}: PropsWithChildren<{
  pt?: string | number | Record<string, string | number>;
  styleProps?: Record<string, any>;
}>) {
  const bgColor = useColorModeValue("white", "brand.700");
  return (
    <Box
      bg={bgColor}
      minH={"var(--chakra-vh)"}
      pt={pt}
      w="full"
      {...styleProps}
    >
      <Header />
      {children}
      <Footer />
    </Box>
  );
}
