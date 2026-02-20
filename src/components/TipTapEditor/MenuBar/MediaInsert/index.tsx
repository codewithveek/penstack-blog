import { FilterParams, MediaResponse } from "@/types";
import Medias from "@/components/Dashboard/Medias";
import { type Editor } from "@tiptap/react";
import { FC, PropsWithChildren } from "react";
import { MediaModal } from "@/components/Dashboard/Medias/MediaModal";

interface MediaInsertProps {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  maxSelection?: number;
  defaultFilters?: Partial<FilterParams>;
}

export const MediaInsert: FC<PropsWithChildren<MediaInsertProps>> = ({
  editor,
  isOpen,
  onClose,
  maxSelection,
  children,
  defaultFilters = {},
}) => {
  return (
    <>
      <MediaModal open={isOpen} onOpenChange={onClose}>
        <Medias
          maxSelection={maxSelection}
          defaultFilters={defaultFilters}
          canSelect={true}
          onSelect={(media: MediaResponse | MediaResponse[]) => {
            if (Array.isArray(media)) {
              media.forEach((media) => {
                editor
                  .chain()
                  .focus()
                  .insertMedia({
                    src: media.url,
                    alt: media.name,
                    type: media.type as "image" | "video" | "audio",
                    caption: media.caption as string,
                  })
                  .run();
              });
            } else {
              editor
                .chain()
                .focus()
                .insertMedia({
                  src: media.url,
                  alt: media?.alt_text || media.name,
                  type: media.type as "image" | "video" | "audio",

                  caption: media.caption as string,
                })
                .run();
            }
            onClose();
          }}
        />
      </MediaModal>
      {children}
    </>
  );
};
