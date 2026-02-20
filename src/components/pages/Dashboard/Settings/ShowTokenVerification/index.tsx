import { Button, Field, HStack, Input, Dialog } from "@chakra-ui/react";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

export const ShowTokenVerification = ({ isOpen }: { isOpen: boolean }) => {
  const { onClose } = useDisclosure();
  const [isVerified, setIsVerified] = useState(false);
  const { data, isPending, mutateAsync } = useMutation({
    mutationKey: ["password_verification"],
    mutationFn: async () => {
      try {
        const { status, data } = await axios.post<{
          data: { isValid: boolean };
        }>("/api/auth/confirm-password", {
          password: "password",
        });

        return data?.data;
      } catch (error) {}
    },
  });

  function handleClose() {
    onClose();
  }
  function verifyPassword() {
    mutateAsync().then((data) => {
      setIsVerified(data?.isValid as boolean);
    });
  }
  return (
    <Dialog.Root size={"sm"} open={isOpen} onOpenChange={handleClose}>
      <Dialog.Positioner><Dialog.Content>
        <Dialog.Body>
          <Field.Root>
            <Field.Label>Verify Password</Field.Label>
            <Input type="password" placeholder="Enter password" />
          </Field.Root>
          <HStack gap={3}>
            <Button
              onClick={handleClose}
              colorPalette="gray"
              loading={isPending}
              loadingText={"verifying..."}
            >
              Cancel
            </Button>
            <Button onClick={verifyPassword}>Verify</Button>
          </HStack>
        </Dialog.Body>
      </Dialog.Content></Dialog.Positioner>
    </Dialog.Root>
  );
};
// TODO: Complete the implementation of the ShowTokenVerification component.
