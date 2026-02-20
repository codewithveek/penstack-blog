import { Button, useDisclosure } from "@chakra-ui/react";
import React from "react";
import { MediaModal } from "@/components/Dashboard/Medias/MediaModal";
import { MediaResponse } from "@/types";

import { Editor } from "@tiptap/react";
import { LuImage } from "react-icons/lu";

export const MediaButton = ({ editor }: { editor: Editor }) => {
  const {
    open: isMediaModalOpen,
    onClose: onMediaModalClose,
    onOpen: onMediaModalOpen,
  } = useDisclosure();

  const handleMediasSelect = (medias: MediaResponse[]) => {
    // Option 1: Use the new bulk insertion command (recommended)
    editor.commands.insertMultipleMedia(
      medias.map((media) => ({
        src: media.url,
        alt: media?.alt_text || media?.name,
        type: media.type as "image" | "video",
        caption: media.caption as string,
      }))
    );

    // Option 2: Manual insertion with proper content array
    // const mediaNodes = medias.map((media) => ({
    //   type: 'penstackMedia',
    //   attrs: {
    //     src: media.url,
    //     alt: media?.alt_text || media?.name,
    //     type: media.type as "image" | "video",
    //     caption: media.caption as string,
    //   },
    // }));
    // editor.chain().focus().insertContent(mediaNodes).run();
  };

  return (
    <>
      <Button
        size="sm"
        variant={editor.isActive("penstackMedia") ? "solid" : "outline"}
        onClick={onMediaModalOpen}
      >
        <LuImage /> Insert Media
      </Button>
      <MediaModal
        open={isMediaModalOpen}
        onOpenChange={onMediaModalClose}
        onSelect={(medias) => {
          handleMediasSelect(medias as MediaResponse[]);
          onMediaModalClose();
        }}
      />
    </>
  );
};
