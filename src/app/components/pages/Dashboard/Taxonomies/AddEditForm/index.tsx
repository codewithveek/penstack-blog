import {
  Button,
  Input,
  Modal,
  Text,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  Stack,
} from "@chakra-ui/react";
import { useTaxonomiesStore } from "../state";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { generateSlug } from "@/utils";

export const AddEditForm: React.FC = () => {
  const activeTab = useTaxonomiesStore((state) => state.type);
  const editItem = useTaxonomiesStore((state) => state.editItem);
  const setEditItem = useTaxonomiesStore((state) => state.setEditItem);
  const isItemModalOpen = useTaxonomiesStore((state) => state.isItemModalOpen);
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setIsItemModalOpen = useTaxonomiesStore(
    (state) => state.setIsItemModalOpen
  );
  const toast = useToast({
    position: "top",
    isClosable: true,
    duration: 3000,
    status: "success",
  });
  function dismissModal() {
    setIsItemModalOpen(false);
    setEditItem(null);
  }
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ name, slug }: { name: string; slug: string }) => {
      await axios.post(`/api/taxonomies/${activeTab}`, {
        name,
        slug,
      });
    },
    onSuccess: (data) => {
      console.log("Success:", data);
      dismissModal();
      toast({
        title: `${activeTab === "tags" ? "Tag" : "Category"} added successfully`,
      });
      queryClient.invalidateQueries({
        queryKey: ["taxonomies", activeTab],
        refetchType: "active",
        type: "active",
      });
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const handleSave = async () => {
    if (inputRef?.current?.value.trim() !== "") {
      const inputValue = inputRef?.current?.value as string;
      const slug = generateSlug(inputValue);
      const name = inputValue;
      await mutateAsync({ name, slug });
    }
  };

  return (
    <Modal
      isOpen={isItemModalOpen}
      onClose={dismissModal}
      initialFocusRef={inputRef}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {editItem ? "Edit" : "Add New"}{" "}
          {activeTab === "categories" ? "Category" : "Tag"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack
            as="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <Text mb={4}>
              Enter the details below. The slug will be auto-generated.
            </Text>
            <Input
              ref={inputRef}
              placeholder="Name"
              defaultValue={editItem?.name || ""}
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button
            loadingText="Saving..."
            isLoading={isPending}
            isDisabled={inputRef?.current?.value?.trim() === "" || isPending}
            onClick={() => handleSave()}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
