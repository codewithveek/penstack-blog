"use client";
import { Box, Stack, useColorModeValue } from "@chakra-ui/react";
import DashHeader from "../../../Dashboard/Header";

export default function CommentsPage() {
  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Box>
      <DashHeader />
      <Box p={{ base: 4, md: 5 }}>
        <Stack spacing={4}></Stack>
      </Box>
    </Box>
  );
}
