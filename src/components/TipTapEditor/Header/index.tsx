import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Hide,
  HStack,
  Icon,
  IconButton,
  Show,
  Stack,
  StackDivider,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
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

function EditorHeader() {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
          <Breadcrumb
            my={1}
            hideBelow={"lg"}
            spacing="8px"
            className="text-sm"
            display={"flex"}
            justifyContent={{ base: "start", md: "center" }}
            separator={<LuChevronRight className="text-gray-500" />}
          >
            <BreadcrumbItem className="font-semibold hover:underline">
              <BreadcrumbLink href="/dashboard">
                <span className="sr-only">Dashboard</span>
                <LuLayoutDashboard />
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbItem className="font-semibold">
              <BreadcrumbLink href="/dashboard/posts">Posts</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink isCurrentPage className="text-gray-500">
                {postTitle}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <HStack
            gap={2}
            divider={<StackDivider />}
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
                  <Icon as={LuClock} />
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
        <Hide below="md">
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
        </Hide>
        <Show below="md">
          <IconButton
            icon={<LuSettings />}
            rounded={"full"}
            variant={"outline"}
            aria-label="Post Settings"
            onClick={onOpen}
          ></IconButton>
        </Show>
      </DashHeader>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Post Settings</DrawerHeader>
          <DrawerBody px={2} bg={useColorModeValue("gray.100", "gray.700")}>
            <Box display={"flex"} justifyContent={"center"} py={3}>
              <SidebarContent />
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default memo(EditorHeader);
