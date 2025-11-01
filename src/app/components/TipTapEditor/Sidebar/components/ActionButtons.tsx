import {
  Button,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  ButtonGroup,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { PermissionGuard } from "../../../PermissionGuard";
import { memo, useState } from "react";
import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import { Link } from "@chakra-ui/next-js";
import { LuExternalLink } from "react-icons/lu";

export const ActionButtons = memo(() => {
  const isSaving = useEditorPostManagerStore((state) => state.isSaving);
  const autoSave = useEditorPostManagerStore((state) => state.autoSave);
  const savePost = useEditorPostManagerStore((state) => state.savePost);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const toast = useToast({
    duration: 3000,
    status: "success",
    position: "top",
  });
  const postId = useEditorPostManagerStore(
    (state) => state.activePost?.post_id
  );
  const updateField = useEditorPostManagerStore((state) => state.updateField);

  function onDraft() {
    updateField("status", "draft");
    if (!autoSave) {
      savePost().then(() => {
        toast({
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
        toast({
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
        toast({
          title: "Post deleted",
          description: "The post has been deleted successfully.",
        });
      });
    }
  }

  const isPublishLoading = isSaving && isPublishing;

  return (
    <HStack gap={5}>
      <ButtonGroup size="sm" isAttached variant="outline" colorScheme="brand">
        {/* Main Publish Button */}
        <PermissionGuard requiredPermission="posts:publish">
          <Button
            isDisabled={isPublishLoading}
            isLoading={isPublishLoading}
            loadingText="Publishing..."
            rounded="md"
            roundedRight="none"
            onClick={onPublish}
            // colorScheme="blue"
            variant="solid"
            flex={1}
          >
            Publish
          </Button>
        </PermissionGuard>

        {/* Dropdown Menu */}
        <Menu>
          <MenuButton
            as={Button}
            size="sm"
            rounded="md"
            roundedLeft="none"
            // colorScheme="blue"
            variant="solid"
            borderLeft="1px solid"
            borderLeftColor="blue.600"
            px={2}
            isDisabled={isPublishLoading}
          >
            <ChevronDownIcon />
          </MenuButton>

          <MenuList px={2} rounded={"lg"}>
            <MenuItem
              onClick={onDraft}
              fontSize="sm"
              fontWeight={"semibold"}
              rounded={"lg"}
            >
              Save as Draft
            </MenuItem>

            <PermissionGuard requiredPermission="posts:delete">
              <MenuItem
                rounded={"lg"}
                onClick={onDelete}
                fontSize="sm"
                color="red.500"
                _hover={{ bg: "red.100" }}
                fontWeight={"semibold"}
              >
                Delete Post
              </MenuItem>
            </PermissionGuard>
          </MenuList>
        </Menu>
      </ButtonGroup>
      <Button
        variant={"outline"}
        as={Link}
        href={"/posts/preview/" + postId}
        rightIcon={<LuExternalLink />}
        size="sm"
        // colorScheme="blue"
        isExternal
      >
        Preview{" "}
      </Button>
    </HStack>
  );
});
ActionButtons.displayName = "ActionButtons";
