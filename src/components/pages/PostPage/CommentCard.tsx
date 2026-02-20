import {
  Box,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";
import React from "react";

import { LuHeart, LuMessageCircle, LuFlag } from "react-icons/lu";
import { formatDate } from "@/utils";
import { useColorModeValue } from "@/components/ui/color-mode";

interface CommentCardProps {
  comment: any; // Replace with proper comment type
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Box
      p={2}
      // borderRadius="xl"
      // border="1px solid"
      // borderColor={borderColor}
      // bg={bgColor}
    >
      <HStack gap={3} align="start">
        <Avatar
          size={"sm"}
          src={comment.author?.avatar}
          name={comment.author?.name}
        />
        <VStack align="start" flex={1} gap={1}>
          <HStack justify="space-between" w="full">
            <VStack align="start" gap={0}>
              <Text fontWeight="bold" fontSize={"14px"}>
                {comment.author?.name}
              </Text>
              <Text fontSize="small" color="gray.500">
                {formatDate(new Date(comment.created_at))}
              </Text>
            </VStack>
            <IconButton
              colorPalette="gray"
              aria-label="Report comment"
              variant="ghost"
              size="sm"
            >
              <LuFlag />
            </IconButton>
          </HStack>

          <Text fontSize={"14px"}>{comment.content}</Text>

          {/* <HStack gap={4}>
            <Button
              size="xs"
              variant="ghost"
              colorPalette="gray"
            ><LuMessageCircle /> Reply</Button>
          </HStack> */}
        </VStack>
      </HStack>
    </Box>
  );
};
