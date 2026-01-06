'use client';

import { Box, Card, CardBody, Container } from "@chakra-ui/react";
import DashHeader from "@/components/Dashboard/Header";
import { PageTitleHeader } from "@/components/Dashboard/PageTitleCard";
import {
    Tabs,
    TabList,
    TabPanels,
    TabPanel,
    Tab,
} from "@chakra-ui/react";
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
    return <Box>
        <DashHeader />
        <Container maxW="container.2xl" p={{ base: 4, md: 5 }}>
            <Card>

                <PageTitleHeader title="Integrations">
                </PageTitleHeader>
                <CardBody>

                    <Tabs
                        defaultIndex={tabs.findIndex((tab) => tab.folder === activeTab)}
                        onChange={(index) => {
                            setActiveTab(tabs[index].folder);
                        }}
                    >
                        <TabList overflowX="auto" className="no-scrollbar" pb={1} gap={3}>
                            {tabs.map((tab) => (
                                <Tab
                                    key={tab.folder}
                                    onClick={() => setActiveTab(tab.folder)}
                                >
                                    {tab.title}
                                </Tab>
                            ))}
                        </TabList>

                        <TabPanels py={5}>
                            <TabPanel px={2}><OAuthProvidersPage /></TabPanel>
                        </TabPanels>
                    </Tabs>
                </CardBody>
            </Card>
        </Container>
    </Box>
}
