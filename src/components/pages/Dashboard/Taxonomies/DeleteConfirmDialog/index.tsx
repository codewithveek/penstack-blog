import { Dialog, Button } from "@chakra-ui/react";

import React, { useState } from "react";

export const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title = "Delete",
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onConfirm: () => void;
  isDeleting: boolean;
}) => {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  function handleActionConfirm() {
    onConfirm?.();
  }
  function handleModalClose() {
    onClose();
  }
  return (
    <>
      <Dialog.Root role="alertdialog"
        open={isOpen}
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onOpenChange={handleModalClose}
      >
        <AlertDialog.Backdrop>
          <Dialog.Positioner><Dialog.Content>
            <Dialog.Header fontSize="lg" fontWeight="bold">
              {title}
            </Dialog.Header>

            <Dialog.Body>
              Are you sure? You can&apos;t undo this action afterwards.
            </Dialog.Body>

            <Dialog.Footer>
              <Button ref={cancelRef} onClick={onClose} colorPalette="gray">
                Cancel
              </Button>
              <Button
                disabled={isDeleting}
                loading={isDeleting}
                loadingText={"Deleting..."}
                colorPalette="red"
                onClick={handleActionConfirm}
                ml={3}
              >
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content></Dialog.Positioner>
        </AlertDialog.Backdrop>
      </Dialog.Root>
    </>
  );
};
