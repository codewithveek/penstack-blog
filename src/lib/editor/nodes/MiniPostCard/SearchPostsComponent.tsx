import { PostSelect } from "@/types";
import {
  VStack,
  Text,
  Image,
  Spinner,
  InputRightElement,
  InputGroup,
  Button,
  HStack,
  Input,
} from "@chakra-ui/react";
import { debounce } from "lodash";
import { LuSearch } from "react-icons/lu";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { objectToQueryParams } from "@/utils";
import { useState } from "react";

interface SearchPostsComponentProps {
  onPostSelect: (post: PostSelect) => void;
}

export const SearchPostsComponent: React.FC<SearchPostsComponentProps> = ({
  onPostSelect,
}) => {
  const [query, setQuery] = useState("");

  const {
    data: posts,
    isPending: isSearching,
    mutateAsync,
  } = useMutation({
    mutationKey: ["search_posts", query],
    mutationFn: async (query: string) => {
      try {
        const { data } = await axios<{ data: PostSelect[] }>(
          `/api/posts/search?${objectToQueryParams({
            q: query,
            limit: 10,
            titleOnly: true,
          })}`
        );
        return data.data;
      } catch (error) {
        console.error("Search failed:", error);
      }
    },
  });

  const handleSearch = debounce(async (query: string) => {
    mutateAsync(query);
  }, 300);

  return (
    <VStack spacing={4}>
      <Text fontSize="medium" fontWeight="bold" color="gray.600">
        Search and select a post to embed
      </Text>
      <InputGroup>
        <Input
          placeholder="Search posts..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
        />
        <InputRightElement>
          {isSearching ? <Spinner size="sm" /> : <LuSearch />}
        </InputRightElement>
      </InputGroup>

      {posts && posts?.length > 0 && (
        <VStack align="stretch" width="100%">
          {posts.map((searchPost) => (
            <Button
              key={searchPost?.id}
              onClick={() => onPostSelect(searchPost)}
              variant="ghost"
              justifyContent="flex-start"
              height="auto"
              py={2}
            >
              <HStack spacing={3}>
                {searchPost?.featured_image && (
                  <Image
                    src={searchPost?.featured_image.url}
                    alt={searchPost?.featured_image.alt_text || ""}
                    boxSize="40px"
                    objectFit="cover"
                    rounded="md"
                  />
                )}
                <Text>{searchPost?.title}</Text>
              </HStack>
            </Button>
          ))}
        </VStack>
      )}
    </VStack>
  );
};
