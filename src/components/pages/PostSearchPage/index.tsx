"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  SimpleGrid,
  Select,
  useColorModeValue,
  Skeleton,
  Spinner,
} from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { useSearchResults } from "@/hooks/usePostsSearch";
import PostCard from "../../../../themes/smooth-land/PostCard";
import { useCallback } from "react";
import debounce from "lodash/debounce";
import { useCategories } from "@/hooks/useCategories";
import NewPostCard from "../../../../themes/raised-land/NewPostCard";
import { PostCardLoader } from "@/themes/smooth-land/PostCardLoader";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { PostsCards } from "@/themes/smooth-land/PostsCards";

const SearchResults = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const { data: categories } = useCategories({});
  const categoriesResults = categories?.results || [];
  const sortByOptions = ["relevant", "recent", "popular"] as const;
  const [queryParams, setQueryParam] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      category: parseAsString.withDefault(""),
      sortBy: parseAsStringLiteral(sortByOptions).withDefault("recent"),
      page: parseAsInteger.withDefault(1),
    },
    { throttleMs: 200 }
  );
  const [searchInputValue, setSearchInputValue] = useState(queryParams.q || "");

  const { data, isLoading } = useSearchResults({
    queryParams,
  });
  const searchResults = data?.results || [];
  const totalResult = data?.meta?.total;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
  };

  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParam({ category: e.target.value });
  };
  const handleSortSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParam({ sortBy: e.target.value as (typeof sortByOptions)[number] });
  };
  const debouncedSearchQuery = useCallback(
    debounce((value: string) => {
      setQueryParam({ q: value });
    }, 1000),
    []
  );
  useEffect(() => {
    debouncedSearchQuery(searchInputValue);
  }, [debouncedSearchQuery, searchInputValue]);
  return (
    <Box minH="calc(100vh - 180px)">
      <Container maxW="7xl" py={8}>
        {/* Search Header */}
        <VStack spacing={6} mb={8}>
          <Heading size="lg" color={textColor}>
            Search Our Blog Collection
          </Heading>
          <InputGroup size="lg" maxW="600px">
            <Input
              placeholder="Search articles..."
              rounded={"xl"}
              bg={bgColor}
              borderColor={borderColor}
              onChange={handleSearch}
              value={searchInputValue || ""}
              _hover={{
                borderColor: useColorModeValue("brand.500", "brand.300"),
              }}
              _focus={{
                ring: "none",
                boxShadow: "0 0 0 2px var(--chakra-colors-brand-500)",
              }}
            />
            <InputRightElement>
              <IconButton
                aria-label="Search"
                icon={isLoading ? <Spinner size="sm" /> : <LuSearch />}
                variant="ghost"
              />
            </InputRightElement>
          </InputGroup>
        </VStack>

        {/* Filters */}
        <HStack spacing={4} mb={8} wrap="wrap" justify={"center"} mx="auto">
          <HStack>
            <Text as={"span"}>Category:</Text>
            <Select
              // placeholder="Category"
              rounded={"md"}
              maxW="200px"
              bg={bgColor}
              borderColor={borderColor}
              onChange={handleCategorySelect}
            >
              <option value="">-</option>
              {categoriesResults?.length > 0 &&
                categoriesResults?.map((category) => (
                  <option
                    key={category?.id}
                    value={category?.name}
                    data-slug={category?.slug}
                  >
                    {category?.name}
                  </option>
                ))}
            </Select>
          </HStack>
          <HStack>
            <Text as={"span"} whiteSpace={"pre"}>
              Sort by:
            </Text>
            <Select
              onChange={handleSortSelect}
              // placeholder="Sort by"
              rounded={"md"}
              maxW="200px"
              bg={bgColor}
              borderColor={borderColor}
            >
              <option value="">-</option>
              <option value="relevant">Most Relevant</option>
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
            </Select>
          </HStack>
        </HStack>

        {/* Results Count */}
        <Box>
          {searchResults?.length > 0 && (
            <Text color={mutedColor} mb={6}>
              Showing {totalResult} results for{" "}
              <Text as="span" fontWeight={500}>
                &quot;{queryParams?.q}
                &quot;
              </Text>
            </Text>
          )}
        </Box>

        <PostsCards posts={searchResults} loading={isLoading} />

        {!isLoading && !searchResults?.length && searchInputValue && (
          <VStack>
            <Text color={mutedColor} my={6}>
              No results found for{" "}
              <Text as="b">&quot;{queryParams?.q}&quot;</Text>
            </Text>
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default SearchResults;
