import { useCategories } from "@/hooks/useCategories";
import { FilteredList } from "../FilteredList";
import { Box, HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { FilterListSkeleton } from "../FilterListSkeleton";
import Pagination from "@/components//Pagination";
import { useState } from "react";
import axios from "axios";
import { PaginatedResponse, TaxonomyItem } from "@/types";
import { objectToQueryParams } from "@/utils";
import { useQuery } from "@tanstack/react-query";

export const CategoriesPanel = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const textColor = useColorModeValue("gray.500", "gray.300");
  const { data: taxonomyData, isPending: isLoading } = useQuery({
    refetchOnWindowFocus: false,
    queryKey: [
      "taxonomies",
      "categories",
      { page: currentPage, hasPostsOnly: false },
    ],
    queryFn: async () => {
      try {
        const { data } = await axios<PaginatedResponse<TaxonomyItem>>(
          `/api/taxonomies/categories?${objectToQueryParams({
            page: currentPage,
            hasPostsOnly: false,
          })}`
        );
        return data;
      } catch (error) {}
    },
  });
  if (isLoading) return <FilterListSkeleton />;
  if (!isLoading && !taxonomyData?.data.length)
    return (
      <VStack>
        <Text color={textColor} fontWeight={500}>
          No categories yet
        </Text>
      </VStack>
    );
  return (
    <>
      <FilteredList items={taxonomyData!} />
      <HStack py={4} justify={"center"}>
        <Pagination
          totalPages={taxonomyData?.meta.totalPages!}
          currentPage={taxonomyData?.meta.page!}
          onPageChange={setCurrentPage}
        />
      </HStack>
    </>
  );
};
