import { Box, Text, Heading, List, Table, Code, Separator, Link, Image } from "@chakra-ui/react";
import React, { memo } from "react";
import parse, {
  domToReact,
  HTMLReactParserOptions,
  Element,
  DOMNode,
} from "html-react-parser";
import { MiniPostCardRenderer } from "../MiniPostCardRenderer";
import { PenstackYouTubeEmbed } from "../YoutubeEmbedRenderer";
import { PenstackTwitterEmbed } from "../TwitterEmbedRenderer";

import { PenstackCodeBlockRenderer } from "../PenstackCodeBlockRenderer";
import PenstackBlockquoteRenderer from "../PenstackBlockquoteRenderer";
import { PenstackHeadingsRenderer } from "../HeadingsRenderer";
import { MediaRenderer } from "../MediaRenderer";
import { MediaAspectRatios, MediaObjectFits } from "@/lib/editor/types";

interface ContentRendererProps {
  content: string;
  className?: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = memo(
  ({ content, className }) => {
    const options: HTMLReactParserOptions = {
      replace: (domNode) => {
        if (domNode instanceof Element && domNode.attribs) {
          if (domNode.name === "pre") {
            const firstChild = domNode.children.find(
              (child): child is Element =>
                child instanceof Element && child.name === "code"
            );
            let language = domNode.attribs?.language;
            if (firstChild) {
              const langClass = firstChild.attribs.class || "";
              language = language || langClass.replace("language-", "");
              ("");
              const code =
                (firstChild.children[0] as DOMNode & { data?: string })?.data ||
                "";
              return (
                <PenstackCodeBlockRenderer language={language} code={code} />
              );
            }
          }

          // Handle PostCard
          if (domNode.attribs?.["data-type"] === "post-card") {
            return (
              <MiniPostCardRenderer
                isEditing={false}
                node={{
                  attrs: {
                    postIds: domNode.attribs.postids,
                    customTitle: domNode.attribs.customtitle,
                  },
                }}
              />
            );
          }
          if (domNode.attribs?.["data-type"] === "media") {
            return (
              <MediaRenderer
                attrs={{
                  src: domNode.attribs.src,
                  type: domNode.attribs["data-media-type"] as
                    | "image"
                    | "video"
                    | "audio",
                  width: domNode.attribs["data-media-width"]
                    ? parseInt(domNode.attribs["data-media-width"], 10)
                    : 300,
                  height: domNode.attribs["data-media-height"]
                    ? parseInt(domNode.attribs["data-media-height"], 10)
                    : 400,
                  aspectRatio: domNode.attribs[
                    "data-media-aspect-ratio"
                  ] as MediaAspectRatios,
                  objectFit: domNode.attribs[
                    "data-media-object-fit"
                  ] as MediaObjectFits,
                  alt: domNode.attribs.alt,
                  caption: domNode.attribs.caption,
                }}
                isEditing={false}
              />
            );
          }
          if (domNode.attribs?.["data-type"] === "penstack-youtube-embed") {
            return (
              <PenstackYouTubeEmbed
                isEditing={false}
                node={{
                  attrs: {
                    videoId: domNode.attribs.videoid,
                    title: domNode.attribs.title,
                  },
                }}
              />
            );
          }
          if (domNode.attribs?.["data-type"] === "penstack-twitter-embed") {
            return (
              <PenstackTwitterEmbed
                isEditing={false}
                node={{
                  attrs: {
                    tweetId: domNode.attribs.tweetid,
                    caption: domNode.attribs.caption,
                    username: domNode.attribs.username,
                  },
                }}
              />
            );
          }

          // Handle P elements without parent
          if (domNode.name === "p" && !domNode.parent) {
            return (
              <Text
                my={"1em"}
                fontSize={["1rem", "1.1rem"]}
                className=" leading-relaxed"
              >
                {domToReact(domNode.children as Element[], options)}
              </Text>
            );
          }
          // Handle P elements with parent
          if (domNode.name === "p" && domNode.parent) {
            return (
              <Text fontSize={["1rem", "1.05rem"]} className="leading-normal">
                {domToReact(domNode.children as Element[], options)}
              </Text>
            );
          }

          if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(domNode.name)) {
            const children = domToReact(domNode.children as Element[], options);
            return (
              <>
                <PenstackHeadingsRenderer
                  isEditing={false}
                  content={children}
                  node={{
                    attrs: {
                      ...(domNode.attribs || {}),
                    },
                  }}
                />
              </>
            );
          }
          if (domNode.name === "ul") {
            return (
              <List.Root
                my={4}
                gap={0}
                // pl={"1rem"}
                className="gradient-bullets"
              >
                {domToReact(domNode.children as Element[], options)}
              </List.Root>
            );
          }
          if (domNode.name === "ol") {
            return (
              <List.Root as="ol" my={4} gap={3} pl={"1rem"}>
                {domToReact(domNode.children as Element[], options)}
              </List.Root>
            );
          }
          if (domNode.name === "li") {
            return (
              <List.Item my={"0.25em"}>
                {domToReact(domNode.children as Element[], options)}
              </List.Item>
            );
          }
          if (domNode.name === "table") {
            return (
              <Table.ScrollArea>
                <Table.Root>
                  {domToReact(domNode.children as Element[], options)}
                </Table.Root>
              </Table.ScrollArea>
            );
          }
          if (domNode.name === "thead") {
            return (
              <Table.Header>
                {domToReact(domNode.children as Element[], options)}
              </Table.Header>
            );
          }
          if (domNode.name === "tbody") {
            return (
              <Table.Body>
                {domToReact(domNode.children as Element[], options)}
              </Table.Body>
            );
          }
          if (domNode.name === "tr") {
            return (
              <Table.Row>{domToReact(domNode.children as Element[], options)}</Table.Row>
            );
          }
          if (domNode.name === "th") {
            return (
              <Table.ColumnHeader>{domToReact(domNode.children as Element[], options)}</Table.ColumnHeader>
            );
          }
          if (domNode.name === "td") {
            return (
              <Table.Cell>{domToReact(domNode.children as Element[], options)}</Table.Cell>
            );
          }
          if (domNode.name === "code") {
            return (
              <Code color={"red.600"} bg="gray.200" _dark={{ bg: "gray.800" }}>
                {domToReact(domNode.children as Element[], options)}
              </Code>
            );
          }
          if (domNode.name === "hr") {
            return <Separator />;
          }
          if (domNode.name === "a") {
            return (
              <Link
                href={domNode.attribs.href}
                rel={domNode.attribs.rel}
                isExternal={domNode.attribs.target === "_blank"}
                _hover={{ textDecoration: "underline" }}
                color={"brandBlue.600"}
                _dark={{ color: "brandBlue.300" }}
              >
                {domToReact(domNode.children as Element[], options)}
              </Link>
            );
          }
          if (domNode.name === "img") {
            return (
              <Image
                src={domNode.attribs.src}
                alt={domNode.attribs.alt}
                {...domNode.attribs}
              />
            );
          }
          if (domNode.name === "blockquote") {
            return (
              <PenstackBlockquoteRenderer
                isEditing={false}
                node={{
                  attrs: {
                    variant: domNode.attribs.variant,
                  },
                }}
              >
                {domToReact(domNode.children as Element[], options)}
              </PenstackBlockquoteRenderer>
            );
          }
        }
      },
    };

    return <Box className={className}>{parse(content, options)}</Box>;
  }
);
ContentRenderer.displayName = "ContentRenderer";
