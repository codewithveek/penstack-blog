import { Button, Menu, ButtonGroup, Icon, HStack } from "@chakra-ui/react";

import { LuChevronDown } from "react-icons/lu";
import { PermissionGuard } from "../../../PermissionGuard";
import { memo, useState } from "react";
import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import Link from "next/link";
import { LuExternalLink } from "react-icons/lu";
import { toaster } from "@/components/ui/toaster";

export const ActionButtons = memo(() => {
  const isSaving = useEditorPostManagerStore((state) => state.isSaving);
  const autoSave = useEditorPostManagerStore((state) => state.autoSave);
  const savePost = useEditorPostManagerStore((state) => state.savePost);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  
  const postId = useEditorPostManagerStore(
    (state) => state.activePost?.post_id
  );
  const updateField = useEditorPostManagerStore((state) => state.updateField);

  function onDraft() {
    updateField("status", "draft");
    if (!autoSave) {
      savePost().then(() => {
        toaster.create({
          title: "Post saved as draft",
          description: "The post has been saved as a draft successfully.",
        });
      });
    }
  }

  function onPublish() {
    setIsPublishing(true);
    updateField("status", "published");
    if (!autoSave) {
      savePost().then(() => {
        setIsPublishing(false);
        toaster.create({
          title: "Post published",
          description: "The post has been published successfully.",
        });
      });
    }
  }

  function onDelete() {
    updateField("status", "deleted");
    if (!autoSave) {
      savePost().then(() => {
        toaster.create({
          title: "Post deleted",
          description: "The post has been deleted successfully.",
        });
      });
    }
  }

  const isPublishLoading = isSaving && isPublishing;

  return (
    <HStack gap={5}>
      <ButtonGroup size="sm" isAttached variant="outline" colorPalette="brand">
        {/* Main Publish Button */}
        <PermissionGuard requiredPermission="posts:publish">
          <Button
            disabled={isPublishLoading}
            loading={isPublishLoading}
            loadingText="Publishing..."
            rounded="md"
            roundedRight="none"
            onClick={onPublish}
            // colorPalette="blue"
            variant="solid"
            flex={1}
          >
            Publish
          </Button>
        </PermissionGuard>

        {/* Dropdown Menu */}
        <Menu.Root>
          <Menu.Trigger asChild>
            <Button
              size="sm"
              rounded="md"
              roundedLeft="none"
              // colorPalette="blue"
              variant="solid"
              borderLeft="1px solid"
              borderLeftColor="blue.600"
              px={2}
              disabled={isPublishLoading}
            >
              <LuChevronDown />
            </Button>
          </Menu.Trigger>

          <Menu.Content px={2} rounded={"lg"}>
            <Menu.Item
              onClick={onDraft}
              fontSize="sm"
              fontWeight={"semibold"}
              rounded={"lg"}
            >
              Save as Draft
            </Menu.Item>

            <PermissionGuard requiredPermission="posts:delete">
              <Menu.Item
                rounded={"lg"}
                onClick={onDelete}
                fontSize="sm"
                color="red.500"
                _hover={{ bg: "red.100" }}
                fontWeight={"semibold"}
              >
                Delete Post
              </Menu.Item>
            </PermissionGuard>
          </Menu.Content>
        </Menu.Root>
      </ButtonGroup>
      <Button
        variant={"outline"}
        asChild
        size="sm"
        // colorPalette="blue"
      >
        <Link href={"/posts/preview/" + postId} target="_blank">
          Preview <LuExternalLink />
        </Link>
      </Button>
    </HStack>
  );
});
ActionButtons.displayName = "ActionButtons";
