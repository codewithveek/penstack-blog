"use client";
import { Box } from "@chakra-ui/react";
import TipTapEditor from "@/components//TipTapEditor";
import { PermissionGuard } from "../../../PermissionGuard";
import { useAuth } from "@/hooks/useAuth";
import { usePenstackEditorStore } from "@/state/penstack-editor";
import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import { decodeAndSanitizeHtml, sanitizeAndEncodeHtml } from "@/utils";
import { PostSelectForEditing } from "@/types";
import { usePostSeoMetaStore } from "@/state/post-seo-meta";

export default function NewPostPage({ post }: { post: PostSelectForEditing }) {
  useEditorPostManagerStore.getState().setPost(post!);
  return <PostEditor />;
}

export function PostEditor() {
  const updateField = useEditorPostManagerStore((state) => state.updateField);
  const activePost = useEditorPostManagerStore((state) => state.activePost);
  const setEditorContent = usePenstackEditorStore(
    (state) => state.setEditorContent
  );
  const setPostIdOrSlug = usePostSeoMetaStore((state) => state.setPostIdOrSlug);
  setPostIdOrSlug(activePost?.post_id || "");

  const { user } = useAuth();

  function onEditorUpdate(content: { html: string; text?: string }) {
    // setEditorContent(content);
    updateField("content", sanitizeAndEncodeHtml(content.html));
  }
  return (
    <PermissionGuard
      requiredPermission={"posts:create"}
      isOwner={activePost?.author_id === user?.id}
    >
      <Box h="full" overflowY="auto">
        <TipTapEditor
          onUpdate={onEditorUpdate}
          initialContent={decodeAndSanitizeHtml(activePost?.content || "")}
        />
      </Box>
    </PermissionGuard>
  );
}
