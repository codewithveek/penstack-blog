import { Button, Input, Dialog, Text, Stack } from "@chakra-ui/react";

import { useTaxonomiesStore } from "../state";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { generateSlug } from "@/utils";
import { toaster } from "@/components/ui/toaster";

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
      toaster.create({
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
    <Dialog.Root
      open={isItemModalOpen}
      onOpenChange={dismissModal}
      initialFocusEl={() => inputRef.current}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            {editItem ? "Edit" : "Add New"}{" "}
            {activeTab === "categories" ? "Category" : "Tag"}
          </Dialog.Header>
          <Dialog.CloseTrigger />
          <Dialog.Body>
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
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              loadingText="Saving..."
              loading={isPending}
              disabled={inputRef?.current?.value?.trim() === "" || isPending}
              onClick={() => handleSave()}
            >
              Save
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
