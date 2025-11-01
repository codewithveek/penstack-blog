import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { SeoPanel } from "./SeoPanel";
import { PublishPanel } from "./PublishPanel";
import { BlockPanel } from "./BlockPanel";
import { useQueryState, parseAsStringLiteral } from "nuqs";

export const EditorSidebarTabPanels = () => {
  const tabs = ["post", "block", "seo"] as const;
  const [activeEditorTab, setActiveEditorTab] = useQueryState(
    "aTab",
    parseAsStringLiteral(tabs).withDefault("post")
  );
  const handleTabChange = (index: number) => {
    setActiveEditorTab(tabs[index]);
  };
  return (
    <Box
      flexShrink={0}
      maxW={360}
      minW={300}
      width={{ base: "100%" }}
      overflowY={"auto"}
      className=""
    >
      <Tabs
        onChange={handleTabChange}
        defaultIndex={tabs.indexOf(activeEditorTab)}
        isLazy
      >
        <TabList
          bg="white"
          borderBottom="2px solid"
          borderColor="gray.200"
          className="rounded-t-lg "
        >
          <Tab>Post</Tab>
          <Tab>SEO</Tab>
        </TabList>
        <TabPanels>
          <TabPanel px={0} pt={1}>
            <PublishPanel />
          </TabPanel>
          {/* <TabPanel px={0} pt={1}>
            <BlockPanel />
          </TabPanel> */}
          <TabPanel px={0} pt={1}>
            <SeoPanel />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
