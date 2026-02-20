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
  return <PostEditor post={post} />;
}

export function PostEditor({ post }: { post: PostSelectForEditing }) {
  const updateField = useEditorPostManagerStore((state) => state.updateField);
  const setPostIdOrSlug = usePostSeoMetaStore((state) => state.setPostIdOrSlug);
  setPostIdOrSlug(post?.post_id || "");

  const { user } = useAuth();

  function onEditorUpdate(content: { html: string; text?: string }) {
    // setEditorContent(content);
    updateField("content", sanitizeAndEncodeHtml(content.html));
  }
  return (
    <PermissionGuard
      requiredPermission={"posts:create"}
      isOwner={post?.author_id === user?.id}
    >
      <Box h="full" overflowY="auto">
        <TipTapEditor
          onUpdate={onEditorUpdate}
          initialContent={decodeAndSanitizeHtml(post?.content || "")}
        />
      </Box>
    </PermissionGuard>
  );
}
