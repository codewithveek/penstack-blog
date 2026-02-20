import { VStack, IconButton, Tooltip, Popover, List, Text, Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import React from "react";

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
      <VStack gap={4}>
        <Tooltip.Root content="Save">
          <IconButton
            variant="outline"
            rounded="full"
            aria-label="bookmark this post"
          ><LuBookmark /></IconButton>
        </Tooltip.Root>

        <Tooltip.Root content="Share post">
          <IconButton
            variant="outline"
            rounded="full"
            aria-label="share this post"
          ><LuShare /></IconButton>
        </Tooltip.Root>
        <Popover.Root trigger={popoverTrigger} placement="right">
          <Popover.Trigger>
            <IconButton
              variant="outline"
              rounded="full"
              aria-label="Add reaction"
            ><LuHeart /></IconButton>
          </Popover.Trigger>
          <Popover.Content rounded="xl" w="auto">
            <Popover.Body>
              <List.Root display="flex" gap={4} alignItems="center">
                <List.Item>
                  <Tooltip.Root content="Like">
                    <IconButton
                      variant="ghost"
                      rounded="full"
                      aria-label="Like"
                    >
                      <Text as="span" fontSize={24}>
                        💖
                      </Text>
                    </IconButton>
                  </Tooltip.Root>
                </List.Item>
                <List.Item>
                  <Tooltip.Root content="Grateful">
                    <IconButton
                      variant="ghost"
                      rounded="full"
                      aria-label="Grateful"
                    >
                      <Text as="span" fontSize={24}>
                        🙌
                      </Text>
                    </IconButton>
                  </Tooltip.Root>
                </List.Item>
                <List.Item>
                  <Tooltip.Root content="Celebrate">
                    <IconButton
                      variant="ghost"
                      rounded="full"
                      aria-label="Celebrate"
                    >
                      <Text as="span" fontSize={24}>
                        🥳
                      </Text>
                    </IconButton>
                  </Tooltip.Root>
                </List.Item>
              </List.Root>
            </Popover.Body>
          </Popover.Content>
        </Popover.Root>
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
