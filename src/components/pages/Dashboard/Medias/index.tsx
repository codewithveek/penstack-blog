"use client";

import { Box } from "@chakra-ui/react";

import Medias from "@/components/Dashboard/Medias";
import DashHeader from "@/components/Dashboard/Header";

export default function DashboardMediaPage() {
  return (
    <Box>
      <DashHeader></DashHeader>
      <Box p={{ base: 4, md: 5 }}>
        <Medias canSelect={false} />
      </Box>
    </Box>
  );
}
