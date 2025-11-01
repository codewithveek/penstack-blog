import React from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Avatar,
  IconButton,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { LuHeart, LuMessageCircle, LuFlag } from "react-icons/lu";
import { formatDate } from "@/utils";

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
      <HStack spacing={3} align="start">
        <Avatar
          size={"sm"}
          src={comment.author?.avatar}
          name={comment.author?.name}
        />
        <VStack align="start" flex={1} spacing={1}>
          <HStack justify="space-between" w="full">
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" fontSize={"14px"}>
                {comment.author?.name}
              </Text>
              <Text fontSize="small" color="gray.500">
                {formatDate(new Date(comment.created_at))}
              </Text>
            </VStack>
            <IconButton
              colorScheme="gray"
              icon={<LuFlag />}
              aria-label="Report comment"
              variant="ghost"
              size="sm"
            />
          </HStack>

          <Text fontSize={"14px"}>{comment.content}</Text>

          {/* <HStack spacing={4}>
            <Button
              leftIcon={<LuMessageCircle />}
              size="xs"
              variant="ghost"
              colorScheme="gray"
            >
              Reply
            </Button>
          </HStack> */}
        </VStack>
      </HStack>
    </Box>
  );
};
