import { FilterParams, MediaResponse } from "@/types";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Heading,
} from "@chakra-ui/react";
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
      <Modal
        isOpen={isOpen}
        isCentered
        onClose={onClose}
        size={{ base: "md", md: "3xl", lg: "5xl", xl: "6xl" }}
        returnFocusOnClose={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Select Media</Heading>
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody px={{ base: 0, md: undefined }}>
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
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

MediaModal.displayName = "MediaModal";
