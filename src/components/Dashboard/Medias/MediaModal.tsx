import { Dialog, Heading } from "@chakra-ui/react";
import { FilterParams, MediaResponse } from "@/types";

import { FC, memo, PropsWithChildren } from "react";
import Medias from ".";

interface MediaModalProps {
  open: boolean;
  onOpenChange: () => void;
  maxSelection?: number;
  defaultFilters?: Partial<FilterParams>;
  multiple?: boolean;
  onSelect?: (media: MediaResponse | MediaResponse[]) => void;
}

export const MediaModal: FC<PropsWithChildren<MediaModalProps>> = memo(
  ({
    open,
    onOpenChange,
    maxSelection,
    children,
    multiple,
    defaultFilters = {},
    onSelect,
  }) => {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange} size="xl">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            maxW={{ base: "md", md: "3xl", lg: "5xl", xl: "6xl" }}
          >
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
                    onOpenChange();
                  }}
                  canSelect={true}
                />
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  }
);

MediaModal.displayName = "MediaModal";
