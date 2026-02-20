import { Box, Tabs } from "@chakra-ui/react";

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
      <Tabs.Root
        onChange={handleTabChange}
        defaultIndex={tabs.indexOf(activeEditorTab)}
        isLazy
      >
        <Tabs.List
          bg="white"
          borderBottom="2px solid"
          borderColor="gray.200"
          className="rounded-t-lg "
        >
          <Tabs.Trigger>Post</Tabs.Trigger>
          <Tabs.Trigger>SEO</Tabs.Trigger>
        </Tabs.List>
        <Tabs.ContentGroup>
          <Tabs.Content px={0} pt={1}>
            <PublishPanel />
          </Tabs.Content>
          {/* <Tabs.Content px={0} pt={1}>
            <BlockPanel />
          </Tabs.Content> */}
          <Tabs.Content px={0} pt={1}>
            <SeoPanel />
          </Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>
    </Box>
  );
};
