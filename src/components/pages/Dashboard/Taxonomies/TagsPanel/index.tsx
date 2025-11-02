import { useTags } from "@/hooks/useTags";
import { FilteredList } from "../FilteredList";
import { HStack, Text, useColorModeValue, VStack } from "@chakra-ui/react";
import { FilterListSkeleton } from "../FilterListSkeleton";
import Pagination from "@/components//Pagination";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PaginatedResponse, TaxonomyItem } from "@/types";
import { objectToQueryParams } from "@/utils";

export const TagsPanel = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const textColor = useColorModeValue("gray.500", "gray.300");
  const { data: taxonomyData, isPending: isLoading } = useQuery({
    refetchOnWindowFocus: false,
    queryKey: [
      "taxonomies",
      "tags",
      { page: currentPage, hasPostsOnly: false },
    ],
    queryFn: async () => {
      try {
        const { data } = await axios<PaginatedResponse<TaxonomyItem>>(
          `/api/taxonomies/tags?${objectToQueryParams({
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
          No tags yet
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
