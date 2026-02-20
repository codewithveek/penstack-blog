import { Box, Breadcrumb, BreadcrumbSeparator, Button, Drawer, Flex, HStack, Icon, IconButton, Show, Stack, Separator, Text } from "@chakra-ui/react";

import DashHeader from "../../Dashboard/Header";
import {
  LuChevronRight,
  LuClock,
  LuLayoutDashboard,
  LuSettings,
} from "react-icons/lu";
import { SidebarContent } from "../Sidebar";
import { memo } from "react";
import React from "react";
import { formatDate } from "@/utils";
import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import { StatusItem } from "../Sidebar/components/StatusItem";
import { useColorModeValue } from "@/components/ui/color-mode";

function EditorHeader() {
  const [isOpen, setIsOpen] = React.useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const isDirty = useEditorPostManagerStore((state) => state.isDirty);
  const hasError = useEditorPostManagerStore((state) => state.hasError);
  const lastUpdate = useEditorPostManagerStore(
    (state) => state.activePost?.updated_at || state.lastUpdate
  );
  const autoSave = useEditorPostManagerStore((state) => state.autoSave);
  const postTitle = useEditorPostManagerStore(
    (state) => state.activePost?.title
  );
  const postStatus = useEditorPostManagerStore(
    (state) => state.activePost?.status
  );
  return (
    <>
      <DashHeader pos="sticky" top={0} zIndex={10}>
        <Stack gap={1.5}>
          <Breadcrumb.Root
            my={1}
            hideBelow={"lg"}
            gap="8px"
            className="text-sm"
            display={"flex"}
            justifyContent={{ base: "start", md: "center" }}
            separator={<LuChevronRight className="text-gray-500" />}
          >
            <Breadcrumb.Item className="font-semibold hover:underline">
              <Breadcrumb.Link href="/dashboard">
                <span className="sr-only">Dashboard</span>
                <LuLayoutDashboard />
              </Breadcrumb.Link>
            </Breadcrumb.Item>

            <Breadcrumb.Item className="font-semibold">
              <Breadcrumb.Link href="/dashboard/posts">Posts</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item isCurrentPage>
              <Breadcrumb.Link isCurrentPage className="text-gray-500">
                {postTitle}
              </Breadcrumb.Link>
            </Breadcrumb.Item>
          </Breadcrumb.Root>
          <HStack
            gap={2}
            separator={<Separator />}
            alignItems="center"
            fontSize="sm"
          >
            <Box>
              <StatusItem status={postStatus as string} />
            </Box>
            {hasError && (
              <Text as="span" color="red.500">
                Error saving post. Please try again.
              </Text>
            )}
            {!hasError && (
              <Flex align="center" gap={1}>
                <HStack align={"center"} gap={1} className="text-gray-500">
                  <Icon><LuClock /></Icon>
                  <Text as="span">Last saved: </Text>
                </HStack>

                {lastUpdate ? (
                  <HStack>
                    <Text className="font-semibold " as="span">
                      {formatDate(new Date(lastUpdate))}
                    </Text>
                    <Text className="text-orange-500" as="span">
                      {isDirty ? "(Unsaved changes)" : ""}
                    </Text>
                  </HStack>
                ) : (
                  isDirty && (
                    <Text as={"span"} className="text-yellow-500 font-semibold">
                      You have Unsaved changes...
                    </Text>
                  )
                )}
              </Flex>
            )}
          </HStack>
        </Stack>
        <Box display={{ base: 'none' }} below="md">
          <Button
            variant="outline"
            gap={2}
            size="sm"
            rounded="full"
            onClick={onOpen}
            display={{ base: "flex", lg: "none" }}
          >
            <LuSettings />
            <Text>Post Settings</Text>
          </Button>
        </Box>
        <Show below="md">
          <IconButton
            rounded={"full"}
            variant={"outline"}
            aria-label="Post Settings"
            onClick={onOpen}
          >
            <LuSettings />
          </IconButton>
        </Show>
      </DashHeader>
      <Drawer.Root open={isOpen} placement="right" onOpenChange={onClose} size="sm">
        <Drawer.Backdrop />
        <Drawer.Content>
          <Drawer.CloseTrigger />
          <Drawer.Header>Post Settings</Drawer.Header>
          <Drawer.Body px={2} bg={useColorModeValue("gray.100", "gray.700")}>
            <Box display={"flex"} justifyContent={"center"} py={3}>
              <SidebarContent />
            </Box>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}

export default memo(EditorHeader);
