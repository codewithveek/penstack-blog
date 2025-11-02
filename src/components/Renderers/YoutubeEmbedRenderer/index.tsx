import {
  Box,
  Input,
  useColorModeValue,
  VStack,
  AspectRatio,
} from "@chakra-ui/react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { ChangeEvent, memo } from "react";

interface PenstackYouTubeEmbedProps {
  isEditing?: boolean;
  node: Partial<NodeViewProps["node"]>;
  updateAttributes?: (attrs: Record<string, any>) => void;
}

export const PenstackYouTubeEmbed: React.FC<PenstackYouTubeEmbedProps> = memo(
  ({ node, isEditing = true, updateAttributes }) => {
    const bgColor = useColorModeValue("gray.50", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
      updateAttributes?.({ title: e.target.value });
    };

    if (!node?.attrs?.videoId) return null;
    const content = (
      <Box
        p={4}
        rounded="lg"
        bg={bgColor}
        my={4}
        maxW="full"
        border="1px"
        borderColor={borderColor}
      >
        <VStack align="stretch" spacing={3}>
          {isEditing && (
            <Input
              border="none"
              borderBottom="1px solid"
              borderColor="gray.300"
              placeholder="Add video title (optional)"
              value={node.attrs.title || ""}
              variant=""
              onChange={handleTitleChange}
            />
          )}
          {!isEditing && node.attrs.title && (
            <Box fontSize="lg" fontWeight="bold">
              {node.attrs.title}
            </Box>
          )}
          <AspectRatio ratio={16 / 9}>
            <iframe
              src={`https://www.youtube.com/embed/${node.attrs.videoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </AspectRatio>
        </VStack>
      </Box>
    );
    return (
      <>
        {isEditing ? (
          <NodeViewWrapper>{content}</NodeViewWrapper>
        ) : (
          <>{content}</>
        )}
      </>
    );
  }
);
PenstackYouTubeEmbed.displayName = "YouTubeEmbed";
