import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react";

import { SectionCard } from "../../../Dashboard/SectionCard";
import isEmpty from "just-is-empty";
import { LuPlus } from "react-icons/lu";
import { useCategories } from "@/hooks/useCategories";
import axios from "axios";

import { useState } from "react";
import { generateSlug } from "@/utils";
import { useEditorPostManagerStore } from "@/state/editor-post-manager";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toaster } from "@/components/ui/toaster";

export const CategorySection = () => {
  const categoryId = useEditorPostManagerStore(
    (state) => state.activePost?.category_id
  );
  const updateField = useEditorPostManagerStore((state) => state?.updateField);

  const [newCategory, setNewCategory] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { data: categories, isPending } = useQuery({
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/taxonomies/categories`);
      return (data?.data || []) as { id: number; name: string; slug: string }[];
    },
  });

  const { mutateAsync: createCategoryMutation, isPending: isCreating } =
    useMutation({
      mutationFn: async (categoryName: string) => {
        const { data } = await axios.post("/api/taxonomies/categories", {
          name: categoryName,
          slug: generateSlug(categoryName),
        });
        return data?.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["categories"],
        });
        setNewCategory("");
      },
    });

  return (
    <SectionCard title="Categories">
      <Box p={4}>
        <RadioGroup.Root
          value={categoryId?.toString() || ""}
          name="category_id"
          onValueChange={(details) =>
            updateField(
              "category_id",
              !isEmpty(details.value) ? Number(details.value) : null
            )
          }
        >
          <Stack gap={2}>
            {categories && categories?.length > 0 && (
              <>
                {categories.map((category) => (
                  <RadioGroup.Item
                    key={category.id}
                    value={category.id.toString()}
                  >
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl />
                    <RadioGroup.ItemText>{category.name}</RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </>
            )}

            {showCategoryInput && (
              <HStack mt={2} align={"center"}>
                <Input
                  autoComplete="off"
                  placeholder="Enter category name"
                  size={"sm"}
                  rounded={"full"}
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      createCategoryMutation(newCategory);
                    }
                  }}
                />
                <Button
                  disabled={isEmpty(newCategory) || isCreating}
                  onClick={() => {
                    createCategoryMutation(newCategory);
                  }}
                  loading={isCreating}
                  size={"sm"}
                  variant={"outline"}
                  fontWeight={500}
                  fontSize={"13px"}
                  rounded={"full"}
                >
                  Add
                </Button>
              </HStack>
            )}
            <Button
              rounded={"full"}
              alignItems={"center"}
              alignSelf="start"
              gap={2}
              mt={4}
              onClick={() => setShowCategoryInput(true)}
              size={"xs"}
              variant={"ghost"}
            >
              <LuPlus size={24} />
              <Text as="span"> Add new category</Text>
            </Button>
          </Stack>
        </RadioGroup.Root>{" "}
      </Box>
    </SectionCard>
  );
};
