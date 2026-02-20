import { FilterParams, MediaResponse } from "@/types";
import Medias from "@/components/Dashboard/Medias";
import { type Editor } from "@tiptap/react";
import { FC, PropsWithChildren } from "react";
import { MediaModal } from "@/components/Dashboard/Medias/MediaModal";

interface MediaInsertProps {
  editor: Editor;
  open: boolean;
  onOpenChange: () => void;
  maxSelection?: number;
  defaultFilters?: Partial<FilterParams>;
}

export const MediaInsert: FC<PropsWithChildren<MediaInsertProps>> = ({
  editor,
  open,
  onOpenChange,
  maxSelection,
  children,
  defaultFilters = {},
}) => {
  return (
    <>
      <MediaModal open={open} onOpenChange={onOpenChange}>
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
            onOpenChange();
          }}
        />
      </MediaModal>
      {children}
    </>
  );
};
