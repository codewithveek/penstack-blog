import { Dialog, Button } from "@chakra-ui/react";

import React, { useState } from "react";

export const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  title = "Delete",
}: {
  open: boolean;
  onOpenChange: () => void;
  title?: string;
  onConfirm: () => void;
  isDeleting: boolean;
}) => {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);

  function handleActionConfirm() {
    onConfirm?.();
  }
  function handleModalClose() {
    onOpenChange();
  }
  return (
    <>
      <Dialog.Root
        role="alertdialog"
        open={open}
        onOpenChange={handleModalClose}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header fontSize="lg" fontWeight="bold">
              {title}
            </Dialog.Header>

            <Dialog.Body>
              Are you sure? You can&apos;t undo this action afterwards.
            </Dialog.Body>

            <Dialog.Footer>
              <Button
                ref={cancelRef}
                onClick={onOpenChange}
                colorPalette="gray"
              >
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
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};
