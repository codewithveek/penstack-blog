import React from "react";
import {
  VStack,
  IconButton,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  List,
  ListItem,
  Text,
  Box,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { LuBookmark, LuHeart, LuShare } from "react-icons/lu";
import { PostSelect } from "@/types";

interface SocialActionsProps {
  post: PostSelect;
}

export const SocialActions: React.FC<SocialActionsProps> = ({ post }) => {
  const popoverTrigger = useBreakpointValue({ base: "click", md: "hover" }) as
    | "click"
    | "hover";

  return (
    <>
      <VStack spacing={4}>
        <Tooltip label="Save">
          <IconButton
            icon={<LuBookmark />}
            variant="outline"
            rounded="full"
            aria-label="bookmark this post"
          />
        </Tooltip>

        <Tooltip label="Share post">
          <IconButton
            icon={<LuShare />}
            variant="outline"
            rounded="full"
            aria-label="share this post"
          />
        </Tooltip>
        <Popover trigger={popoverTrigger} placement="right">
          <PopoverTrigger>
            <IconButton
              icon={<LuHeart />}
              variant="outline"
              rounded="full"
              aria-label="Add reaction"
            />
          </PopoverTrigger>
          <PopoverContent rounded="xl" w="auto">
            <PopoverBody>
              <List display="flex" gap={4} alignItems="center">
                <ListItem>
                  <Tooltip label="Like">
                    <IconButton
                      icon={
                        <Text as="span" fontSize={24}>
                          💖
                        </Text>
                      }
                      variant="ghost"
                      rounded="full"
                      aria-label="Like"
                    />
                  </Tooltip>
                </ListItem>
                <ListItem>
                  <Tooltip label="Grateful">
                    <IconButton
                      icon={
                        <Text as="span" fontSize={24}>
                          🙌
                        </Text>
                      }
                      variant="ghost"
                      rounded="full"
                      aria-label="Grateful"
                    />
                  </Tooltip>
                </ListItem>
                <ListItem>
                  <Tooltip label="Celebrate">
                    <IconButton
                      icon={
                        <Text as="span" fontSize={24}>
                          🥳
                        </Text>
                      }
                      variant="ghost"
                      rounded="full"
                      aria-label="Celebrate"
                    />
                  </Tooltip>
                </ListItem>
              </List>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </VStack>

      <Box
        as={Flex}
        flexDir="column"
        alignItems="center"
        fontSize={{ base: "sm", md: "md" }}
      >
        <Text as="span" fontWeight="bold">
          {post?.views?.count || 0}
        </Text>
        <Text as="span" fontSize="90%">
          views
        </Text>
      </Box>
    </>
  );
};
