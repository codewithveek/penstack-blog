"use client";

import {
  Box,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  useToast,
  Card,
  CardBody,
  Alert,
  AlertIcon,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { SiteSettings } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import DashHeader from "../../../Dashboard/Header";
import Loader from "@/components//Loader";
import { MediaModal } from "@/components//Dashboard/Medias/MediaModal";
import { GeneralPanel } from "./TabPanels/GeneralPanel";
import { AnalyticsPanel } from "./TabPanels/AnalyticsPanel";
import { MonitoringPanel } from "./TabPanels/MonitoringPanel";
import { MediaPanel } from "./TabPanels/MediaPanel";
import { EmailPanel } from "./TabPanels/EmailPanel";
import { AdvancedPanel } from "./TabPanels/AdvancedPanel";
import { PageTitleHeader } from "../../../Dashboard/PageTitleCard";
import { useSiteConfig } from "@/context/SiteConfig";
import { parseAsString, useQueryState } from "nuqs";
import { isEqual } from "lodash";
import { MiscPanel } from "./TabPanels/MiscPanel";
import { SocialPanel } from "./TabPanels/SocialPanel";

export default function DashboardSettingsPage() {
  const toast = useToast({ position: "top" });
  const [isLoading, setIsLoading] = useState(false);
  const settingsContext = useSiteConfig();
  const [settings, setSettings] = useState<SiteSettings>(settingsContext);
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const { isOpen, onClose, onOpen } = useDisclosure();

  const [originalSettings, setOriginalSettings] =
    useState<SiteSettings>(settingsContext);
  const [currentMediaField, setCurrentMediaField] = useState<
    "siteLogo" | "siteFavicon" | "siteOpengraph" | "siteLogoMobile" | null
  >(null);

  const { data, isFetching } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  async function fetchSettings() {
    try {
      const { data } = await axios<{ data: SiteSettings; message?: string }>(
        "/api/settings"
      );
      const fetchedData = data.data;
      setSettings({ ...fetchedData });
      setOriginalSettings({ ...fetchedData });
      return fetchedData;
    } catch (error) {
      toast({
        title: "Failed to load settings",
        status: "error",
        duration: 3000,
      });
    }
  }
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsString.withDefault("general")
  );
  const tabs = [
    { folder: "general", title: "General" },
    { folder: "analytics", title: "Analytics" },
    { folder: "monitoring", title: "Monitoring" },
    { folder: "media", title: "Media" },
    { folder: "email", title: "Email" },
    { folder: "social", title: "Socials" },
    { folder: "advanced", title: "Advanced" },
    { folder: "misc", title: "Miscilaneous" },
  ];

  useEffect(() => {
    const settingsChanged = !isEqual(settings, originalSettings);
    setHasChanges(settingsChanged);
  }, [settings, originalSettings]);

  const handleInputChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], value },
    }));
  };

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const handleMediaSelect = (url: string) => {
    if (currentMediaField) {
      handleInputChange(currentMediaField, url);
    }
    onClose();
    setCurrentMediaField(null);
  };

  const openMediaModal = (
    field: "siteLogo" | "siteFavicon" | "siteOpengraph" | "siteLogoMobile"
  ) => {
    setCurrentMediaField(field);
    onOpen();
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const changedSettings = Object.entries(settings).reduce(
        (acc, [key, value]) => {
          if (!isEqual(value, originalSettings[key])) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Partial<SiteSettings>
      );

      const { status } = await axios.post("/api/settings", changedSettings);

      if (status < 200 || status >= 400)
        throw new Error("Failed to save settings");

      setHasChanges(false);
      queryClient.invalidateQueries({
        queryKey: ["settings"],
        refetchType: "all",
      });
      toast({
        title: "Settings saved successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to save settings",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <Loader loadingText="Loading settings..." />;
  }

  return (
    <Box>
      <DashHeader />
      <Container maxW="container.2xl" p={{ base: 4, md: 5 }}>
        <Card>
          <PageTitleHeader title={"Settings"}>
            <Button
              isLoading={isLoading}
              onClick={handleSave}
              rounded="md"
              isDisabled={!hasChanges}
            >
              Save Changes
            </Button>
          </PageTitleHeader>

          <CardBody>
            {hasChanges && (
              <Alert status="info" colorScheme="brand" mb={4} rounded="md">
                <AlertIcon />
                You have unsaved changes
              </Alert>
            )}

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
                <TabPanel px={2}>
                  <GeneralPanel
                    settings={settings}
                    handleInputChange={handleInputChange}
                    handleToggle={handleToggle}
                    openMediaModal={openMediaModal}
                  />
                </TabPanel>
                <TabPanel>
                  <AnalyticsPanel
                    settings={settings}
                    handleInputChange={handleInputChange}
                    handleToggle={handleToggle}
                  />
                </TabPanel>
                <TabPanel>
                  <MonitoringPanel
                    settings={settings}
                    handleInputChange={handleInputChange}
                    handleToggle={handleToggle}
                  />
                </TabPanel>
                <TabPanel>
                  <MediaPanel
                    settings={settings}
                    handleInputChange={handleInputChange}
                    handleToggle={handleToggle}
                  />
                </TabPanel>
                <TabPanel>
                  <EmailPanel
                    settings={settings}
                    handleInputChange={handleInputChange}
                    handleToggle={handleToggle}
                  />
                </TabPanel>
                <TabPanel>
                  <SocialPanel
                    settings={settings}
                    handleInputChange={handleInputChange}
                    handleToggle={handleToggle}
                  />
                </TabPanel>
                <TabPanel>
                  <AdvancedPanel
                    settings={settings}
                    handleInputChange={handleInputChange}
                    handleToggle={handleToggle}
                  />
                </TabPanel>
                <TabPanel>
                  <MiscPanel
                    settings={settings}
                    handleInputChange={handleInputChange}
                    handleToggle={handleToggle}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Container>
      <MediaModal
        isOpen={isOpen}
        onClose={onClose}
        multiple={false}
        maxSelection={1}
        onSelect={(media) => {
          if (!Array.isArray(media)) handleMediaSelect(media.url);
        }}
      />
    </Box>
  );
}
