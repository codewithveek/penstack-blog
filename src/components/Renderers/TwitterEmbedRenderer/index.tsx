import { Link } from "@chakra-ui/next-js";
import {
  Box,
  useColorMode,
  Card,
  CardBody,
  Textarea,
  Stack,
  Skeleton,
  SkeletonText,
  HStack,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import Script from "next/script";
import { ChangeEvent, memo, useEffect, useState } from "react";
import { TwitterTweetEmbed } from "react-twitter-embed";

interface PenstackTwitterEmbedProps {
  isEditing?: boolean;
  node: Partial<NodeViewProps["node"]>;
  updateAttributes?: (attrs: Record<string, any>) => void;
}

export const PenstackTwitterEmbed: React.FC<PenstackTwitterEmbedProps> = ({
  node,
  isEditing = true,
  updateAttributes,
}) => {
  const { colorMode } = useColorMode();
  const [hasTweet, setHasTweet] = useState(true);
  const handleCaptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateAttributes?.({ caption: e.target.value });
  };

  if (!node?.attrs?.tweetId) return null;
  const content = (
    <Card maxW="full">
      <CardBody>
        <Stack spacing={2}>
          <Box>
            <TwitterTweetEmbed
              tweetId={node.attrs.tweetId}
              onLoad={(e) => {
                setHasTweet(e);
              }}
              placeholder={
                <Stack>
                  <HStack>
                    <SkeletonCircle size="10" />
                    <SkeletonText noOfLines={1} width="60%" rounded={"xl"} />
                  </HStack>
                  <SkeletonText noOfLines={4} spacing="4" rounded={"xl"} />
                  <Skeleton height="150px" mt={4} rounded={"xl"} />
                </Stack>
              }
            />
            {!hasTweet && (
              <Box>
                <Text>
                  Sorry, we couldn&apos;t load the tweet. Please try again
                  later.
                </Text>
                <Link
                  color={"brand.500"}
                  textDecor={"underline"}
                  isExternal
                  href={`https://x.com/${node.attrs?.username || "x"}/status/${node.attrs.tweetId}`}
                >
                  View tweet
                </Link>
              </Box>
            )}
            {hasTweet && isEditing && (
              <Textarea
                rows={2}
                border="none"
                borderBottom="1px solid"
                borderColor="gray.300"
                placeholder="Add caption (optional)"
                value={node.attrs.caption || ""}
                variant=""
                onChange={handleCaptionChange}
                resize="none"
              />
            )}
          </Box>

          {!isEditing && node.attrs.caption && (
            <Box fontSize="md" fontWeight="semibold">
              {node.attrs.caption}
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
  return (
    <>
      <Script
        src="https://platform.twitter.com/widgets.js"
        async
        onLoad={() => {
          console.log("Twitter script loaded");
        }}
      />{" "}
      {isEditing ? <NodeViewWrapper>{content}</NodeViewWrapper> : content}
    </>
  );
};

PenstackTwitterEmbed.displayName = "TwitterEmbed";
// <blockquote class="twitter-tweet"><p lang="en" dir="ltr">What&#39;s the best drag-and-drop way to build AI agents right now?<br><br>- Langflow<br>- Flowise<br>- Gumloop<br>- n8n<br><br>or something else? <a href="https://t.co/8WPZWVJcL8">pic.twitter.com/8WPZWVJcL8</a></p>&mdash; Jeremy Nguyen ✍🏼 🚢 (@JeremyNguyenPhD) <a href="https://twitter.com/JeremyNguyenPhD/status/1885998878341877858?ref_src=twsrc%5Etfw">February 2, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
