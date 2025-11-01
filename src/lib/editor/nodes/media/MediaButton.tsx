import { MediaModal } from "@/components//Dashboard/Medias/MediaModal";
import { MediaResponse } from "@/types";
import { Button, useDisclosure } from "@chakra-ui/react";
import { Editor } from "@tiptap/react";
import { LuImage } from "react-icons/lu";

export const MediaButton = ({ editor }: { editor: Editor }) => {
  const {
    isOpen: isMediaModalOpen,
    onClose: onMediaModalClose,
    onOpen: onMediaModalOpen,
  } = useDisclosure();
  const handleMediasSelect = (medias: MediaResponse[]) => {
    medias.forEach((media) => {
      editor.commands.insertMedia({
        src: media.url,
        alt: media?.alt_text || media?.name,
        type: media.type as "image" | "video",
        caption: media.caption as string,
      });
    });
  };

  return (
    <>
      <Button
        size="sm"
        leftIcon={<LuImage />}
        variant={editor.isActive("penstackMedia") ? "solid" : "outline"}
        onClick={() => {
          onMediaModalOpen();
        }}
      >
        Insert Media
      </Button>
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={onMediaModalClose}
        onSelect={(medias) => {
          handleMediasSelect(medias as MediaResponse[]);
          onMediaModalClose();
        }}
      />
    </>
  );
};
