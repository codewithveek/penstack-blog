import { TaxonomyItem, TaxonomyItemsWithMeta } from "@/types";
import {
  Flex,
  Box,
  Grid,
  GridItem,
  Stack,
  Badge,
  Menu,
  Button,
  Checkbox,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";
import { useState } from "react";
import {
  LuArrowUpDown,
  LuFolderTree,
  LuTag,
  LuEllipsisVertical as LuMoreVertical,
  LuPen as LuFileEdit,
  LuTrash2,
} from "react-icons/lu";
import { useTaxonomiesStore } from "../state";
import { DeleteConfirmDialog } from "../DeleteConfirmDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface SortConfig {
  key: keyof TaxonomyItem;
  direction: "asc" | "desc";
}

interface FilteredListProps {
  items: TaxonomyItemsWithMeta;
}
export const FilteredList: React.FC<FilteredListProps> = ({ items }) => {
  const [open, setOpen] = useState(false);
  const onOpenChange = () => setOpen(!open);
  const queryClient = useQueryClient();
  const searchTerm = useTaxonomiesStore((state) => state.searchTerm);
  const type = useTaxonomiesStore((state) => state.type);
  const setEditItem = useTaxonomiesStore((state) => state.setEditItem);
  const setDeleteItemId = useTaxonomiesStore((state) => state.setDeleteItemId);
  const deleteItemId = useTaxonomiesStore((state) => state.deleteItemId);
  const setisItemModalOpen = useTaxonomiesStore(
    (state) => state.setIsItemModalOpen
  );
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { mutateAsync, isPending: isDeleting } = useMutation({
    mutationKey: ["taxonomies_delete", type],
    mutationFn: async () => {
      try {
        const itemsToDelete =
          selectedItems.length > 0 ? selectedItems : [deleteItemId];
        await Promise.all(
          itemsToDelete.map((id) =>
            axios.delete(`/api/taxonomies/${type}/${id}`)
          )
        );
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["taxonomies", type],
        refetchType: "all",
      });
      toaster.create({
        title: `${selectedItems.length > 1 ? "Items" : "Item"} deleted successfully`,
      });
      setSelectedItems([]);
      setOpen(false);
    },
    onError: (error) => {
      toaster.create({
        title: "Error deleting items",
        description: error.message,
        type: "error",
      });
    },
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });

  const handleSort = (key: keyof TaxonomyItem): void => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };
  const filteredItems = items.data
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      return a[sortConfig.key] > b[sortConfig.key] ? direction : -direction;
    });

  const handleDelete = (id: number): void => {
    setDeleteItemId(id);
    setOpen(true);
  };

  const handleBulkDelete = (): void => {
    if (selectedItems.length > 0) {
      setOpen(true);
    }
  };

  const toggleItemSelection = (id: number): void => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleAllSelection = (): void => {
    setSelectedItems((prev) =>
      prev.length === filteredItems.length
        ? []
        : filteredItems.map((item) => item.id)
    );
  };

  async function handleDeleteConfirm() {
    try {
      await mutateAsync();
      setOpen(false);
    } catch (error) {
      console.error("Error deleting items:", error);
    }
  }

  const handleEdit = (item: TaxonomyItem): void => {
    setEditItem(item);
    setisItemModalOpen(true);
  };

  const headerBg = useColorModeValue("gray.100", "gray.700");
  const cellBg = useColorModeValue("white", "gray.800");
  const cellTextColor = useColorModeValue("gray.800", "gray.200");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Flex gap={4} overflowX={"auto"}>
      <Box flexShrink={0} flexGrow={1} mb={4}>
        <Flex justify="space-between" mb={4}>
          {selectedItems.length > 0 && (
            <Button colorPalette="red" size="sm" onClick={handleBulkDelete}>
              <LuTrash2 /> Delete Selected ({selectedItems.length})
            </Button>
          )}
        </Flex>
        <Grid
          templateColumns="repeat(13, 1fr)"
          alignItems={"center"}
          gap={4}
          px={4}
          py={2}
          mb={3}
          bg={headerBg}
          borderRadius="lg"
          fontWeight="medium"
          fontSize="sm"
        >
          <GridItem colSpan={1}>
            <Checkbox.Root
              checked={selectedItems.length === filteredItems.length}
              onChange={toggleAllSelection}
            />
          </GridItem>
          <GridItem colSpan={1} />
          <GridItem colSpan={3}>
            <Button
              variant="ghost"
              onClick={() => handleSort("name")}
              ml={-3}
              size="sm"
              color={"inherit"}
            >
              Name <LuArrowUpDown />
            </Button>
          </GridItem>
          <GridItem colSpan={4}>Slug</GridItem>
          <GridItem colSpan={2}>
            <Button
              variant="ghost"
              onClick={() => handleSort("postCount")}
              size="sm"
              color={"inherit"}
              ml={-3}
            >
              Posts Count <LuArrowUpDown />
            </Button>
          </GridItem>
          <GridItem colSpan={2}>Actions</GridItem>
        </Grid>

        <Stack>
          {filteredItems.map((item) => (
            <Grid
              key={item.id}
              templateColumns="repeat(13, 1fr)"
              gap={4}
              px={4}
              py={3}
              bg={cellBg}
              borderRadius="lg"
              border="1px"
              borderColor={borderColor}
              _hover={{ bg: headerBg }}
              alignItems="center"
            >
              <GridItem colSpan={1}>
                <Checkbox.Root
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                />
              </GridItem>
              <GridItem colSpan={1}>
                {type === "categories" ? <LuFolderTree /> : <LuTag />}
              </GridItem>
              <GridItem colSpan={3} fontWeight="medium">
                {item.name}
              </GridItem>
              <GridItem colSpan={4} color={cellTextColor}>
                {item.slug}
              </GridItem>
              <GridItem colSpan={2}>
                <Badge>{item.postCount}</Badge>
              </GridItem>
              <GridItem colSpan={2}>
                <Menu.Root arrowPadding={10}>
                  <Menu.Trigger asChild>
                    <Button variant="ghost" size="sm">
                      <LuMoreVertical />
                    </Button>
                  </Menu.Trigger>
                  <Menu.Content>
                    <Menu.Item value="edit" onClick={() => handleEdit(item)}>
                      <LuFileEdit /> Edit
                    </Menu.Item>
                    <Menu.Item
                      value="delete"
                      color="red.600"
                      onClick={() => handleDelete(item.id)}
                    >
                      <LuTrash2 /> Delete
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Root>
              </GridItem>
            </Grid>
          ))}
        </Stack>
      </Box>
      <DeleteConfirmDialog
        isDeleting={isDeleting}
        open={open}
        onOpenChange={onOpenChange}
        onConfirm={handleDeleteConfirm}
      />
    </Flex>
  );
};
// TODO: Refactor the delete API to accept multiple IDs to delete
