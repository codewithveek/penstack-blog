"use client";

import { Box, Stack } from "@chakra-ui/react";

import DashHeader from "../../../Dashboard/Header";
import { useColorModeValue } from "@/components/ui/color-mode";

export default function CommentsPage() {
  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Box>
      <DashHeader />
      <Box p={{ base: 4, md: 5 }}>
        <Stack gap={4}></Stack>
      </Box>
    </Box>
  );
}
