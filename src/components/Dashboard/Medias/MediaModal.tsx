import { Dialog, Heading } from "@chakra-ui/react";
import { FilterParams, MediaResponse } from "@/types";

import { FC, memo, PropsWithChildren } from "react";
import Medias from ".";

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxSelection?: number;
  defaultFilters?: Partial<FilterParams>;
  multiple?: boolean;
  onSelect?: (media: MediaResponse | MediaResponse[]) => void;
}

export const MediaModal: FC<PropsWithChildren<MediaModalProps>> = memo(
  ({
    isOpen,
    onClose,
    maxSelection,
    children,
    multiple,
    defaultFilters = {},
    onSelect,
  }) => {
    return (
      <Dialog.Root
        open={isOpen}
        isCentered
        onOpenChange={onClose}
        size={{ base: "md", md: "3xl", lg: "5xl", xl: "6xl" }}
        returnFocusOnClose={false}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner><Dialog.Content>
          <Dialog.Header>
            <Heading size="md">Select Media</Heading>
            <Dialog.CloseTrigger />
          </Dialog.Header>
          <Dialog.Body px={{ base: 0, md: undefined }}>
            {children ? (
              children
            ) : (
              <Medias
                multiple={multiple}
                defaultFilters={defaultFilters}
                maxSelection={maxSelection}
                onSelect={(media: MediaResponse | MediaResponse[]) => {
                  onSelect?.(media);
                  onClose();
                }}
                canSelect={true}
              />
            )}
          </Dialog.Body>
        </Dialog.Content></Dialog.Positioner>
      </Dialog.Root>
    );
  }
);

MediaModal.displayName = "MediaModal";
