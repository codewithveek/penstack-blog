"use client";

import { Box, Card, Container, Tabs } from "@chakra-ui/react";

import DashHeader from "@/components/Dashboard/Header";
import { PageTitleHeader } from "@/components/Dashboard/PageTitleCard";

import { useState } from "react";
import OAuthProvidersPage from "../Settings/Oauth";
export default function IntegrationsPage() {
  const tabs = [
    {
      title: "OAuth",
      folder: "oauth",
    },
  ];
  const [activeTab, setActiveTab] = useState(tabs[0].folder);
  return (
    <Box>
      <DashHeader />
      <Container maxW="container.2xl" p={{ base: 4, md: 5 }}>
        <Card.Root>
          <PageTitleHeader title="Integrations"></PageTitleHeader>
          <Card.Body>
            <Tabs.Root
              defaultValue={activeTab}
              onValueChange={(details) => {
                setActiveTab(details.value);
              }}
            >
              <Tabs.List
                overflowX="auto"
                className="no-scrollbar"
                pb={1}
                gap={3}
              >
                {tabs.map((tab) => (
                  <Tabs.Trigger
                    key={tab.folder}
                    value={tab.folder}
                    onClick={() => setActiveTab(tab.folder)}
                  >
                    {tab.title}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Tabs.ContentGroup py={5}>
                <Tabs.Content value="oauth" px={2}>
                  <OAuthProvidersPage />
                </Tabs.Content>
              </Tabs.ContentGroup>
            </Tabs.Root>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  );
}
