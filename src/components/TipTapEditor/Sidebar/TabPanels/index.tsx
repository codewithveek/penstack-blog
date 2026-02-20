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
  const handleTabChange = (details: { value: string }) => {
    setActiveEditorTab(details.value as typeof activeEditorTab);
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
        onValueChange={handleTabChange}
        defaultValue={activeEditorTab}
        lazyMount
      >
        <Tabs.List
          bg="white"
          borderBottom="2px solid"
          borderColor="gray.200"
          className="rounded-t-lg "
        >
          <Tabs.Trigger value="post">Post</Tabs.Trigger>
          <Tabs.Trigger value="seo">SEO</Tabs.Trigger>
        </Tabs.List>
        <Tabs.ContentGroup>
          <Tabs.Content value="post" px={0} pt={1}>
            <PublishPanel />
          </Tabs.Content>
          {/* <Tabs.Content value="block" px={0} pt={1}>
            <BlockPanel />
          </Tabs.Content> */}
          <Tabs.Content value="seo" px={0} pt={1}>
            <SeoPanel />
          </Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>
    </Box>
  );
};
