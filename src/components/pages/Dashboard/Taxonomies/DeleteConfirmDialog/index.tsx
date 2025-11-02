import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react";
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
      <AlertDialog
        isOpen={isOpen}
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={handleModalClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {title}
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can&apos;t undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} colorScheme="gray">
                Cancel
              </Button>
              <Button
                isDisabled={isDeleting}
                isLoading={isDeleting}
                loadingText={"Deleting..."}
                colorScheme="red"
                onClick={handleActionConfirm}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
