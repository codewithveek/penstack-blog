import {
  useToast,
  useColorModeValue,
  useBreakpointValue,
  Button,
  Heading,
  Box,
  Card,
  CardBody,
  Textarea,
  VStack,
  Divider,
  Text,
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  HStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { LuMessageCircle } from "react-icons/lu";
import { CommentCard } from "./CommentCard";
import { PostSelect } from "@/types";
import { sanitizeAndEncodeHtml } from "@/utils";
import { useAuth } from "@/hooks/useAuth";
import isEmpty from "just-is-empty";
import { SignInComponent } from "../../Auth/SignIn";

export const CommentsSection = ({ post }: { post: PostSelect }) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { user } = useAuth();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const highlightColor = useColorModeValue("brand.50", "brand.900");

  // const bgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.800");
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  async function fetchComments() {
    try {
      const { data } = await axios(`/api/posts/${post?.post_id}/comments`);
      return data.data;
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  }
  const {
    data: comments,
    isPending: isFetching,
    refetch,
  } = useQuery({
    queryKey: ["comments", post?.post_id || ""],
    queryFn: fetchComments,
  });

  // Handle new comment submission
  const handleCommentSubmit = async () => {
    if (isEmpty(user)) {
      localStorage.setItem("penstack:comment", newComment);
      onOpen();
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `/api/posts/${post?.post_id}/comments`,
        {
          content: sanitizeAndEncodeHtml(newComment),
        }
      );

      if (response.status === 201) {
        toast({
          title: "Comment posted successfully",
          status: "success",
        });
        setNewComment("");
        refetch();
      }
    } catch (error) {
      toast({
        title: "Failed to post comment",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const storedComment = localStorage.getItem("penstack:comment") || "";
    if (storedComment) {
      setNewComment(storedComment);
      localStorage.removeItem("penstack:comment");
    }
  }, []);
  return (
    <Box
      mt={8}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      bg={bgColor}
    >
      <Heading size="md" mb={2} pt={4} pl={4}>
        Leave a Comment
      </Heading>

      {/* New Comment Form */}
      <Card mb={4} rounded="lg">
        <CardBody bg={bgColor}>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            size="md"
            mb={4}
            maxH={100}
          />
          <Button
            size={"sm"}
            isLoading={isSubmitting}
            onClick={handleCommentSubmit}
          >
            Post Comment
          </Button>
        </CardBody>
      </Card>

      {/* Comments List */}
      {!isFetching && comments?.length > 0 ? (
        <VStack align="stretch" divider={<Divider />}>
          {comments.map((comment: any) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </VStack>
      ) : (
        !isFetching &&
        comments?.length === 0 && (
          <Card bg={highlightColor}>
            <CardBody p={3} pt={1} textAlign="center">
              <HStack
                mx={"auto"}
                maxW={"500px"}
                wrap={"wrap"}
                justify={"center"}
                align={"center"}
                gap={2}
              >
                <LuMessageCircle size={35} />
                <Text fontSize="large">
                  Be the first to share your thoughts!
                </Text>
              </HStack>
            </CardBody>
          </Card>
        )
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalBody>
            <SignInComponent cbUrl={currentUrl} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};
