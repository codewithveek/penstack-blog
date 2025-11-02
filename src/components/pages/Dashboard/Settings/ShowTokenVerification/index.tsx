import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from "@chakra-ui/react";
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
    <Modal size={"sm"} isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalBody>
          <FormControl>
            <FormLabel>Verify Password</FormLabel>
            <Input type="password" placeholder="Enter password" />
          </FormControl>
          <HStack gap={3}>
            <Button
              onClick={handleClose}
              colorScheme="gray"
              isLoading={isPending}
              loadingText={"verifying..."}
            >
              Cancel
            </Button>
            <Button onClick={verifyPassword}>Verify</Button>
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
// TODO: Complete the implementation of the ShowTokenVerification component.
