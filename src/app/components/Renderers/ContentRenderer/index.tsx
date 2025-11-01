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
import {
  Box,
  Text,
  Heading,
  UnorderedList,
  OrderedList,
  ListItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Code,
  Divider,
  Link,
  Image,
} from "@chakra-ui/react";
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
                fontSize={["1.1rem", "1.2rem"]}
                className="leading"
              >
                {domToReact(domNode.children as Element[], options)}
              </Text>
            );
          }
          // Handle P elements with parent
          if (domNode.name === "p" && domNode.parent) {
            return (
              <Text fontSize={["1rem", "1.05rem"]} className="leading">
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
              <UnorderedList
                my={4}
                spacing={0}
                // pl={"1rem"}
                className="gradient-bullets"
              >
                {domToReact(domNode.children as Element[], options)}
              </UnorderedList>
            );
          }
          if (domNode.name === "ol") {
            return (
              <OrderedList my={4} spacing={3} pl={"1rem"}>
                {domToReact(domNode.children as Element[], options)}
              </OrderedList>
            );
          }
          if (domNode.name === "li") {
            return (
              <ListItem my={"0.25em"}>
                {domToReact(domNode.children as Element[], options)}
              </ListItem>
            );
          }
          if (domNode.name === "table") {
            return (
              <TableContainer>
                <Table>
                  {domToReact(domNode.children as Element[], options)}
                </Table>
              </TableContainer>
            );
          }
          if (domNode.name === "thead") {
            return (
              <Thead>
                {domToReact(domNode.children as Element[], options)}
              </Thead>
            );
          }
          if (domNode.name === "tbody") {
            return (
              <Tbody>
                {domToReact(domNode.children as Element[], options)}
              </Tbody>
            );
          }
          if (domNode.name === "tr") {
            return (
              <Tr>{domToReact(domNode.children as Element[], options)}</Tr>
            );
          }
          if (domNode.name === "th") {
            return (
              <Th>{domToReact(domNode.children as Element[], options)}</Th>
            );
          }
          if (domNode.name === "td") {
            return (
              <Td>{domToReact(domNode.children as Element[], options)}</Td>
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
            return <Divider />;
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

// function convertNodeToReactElements(nodes: any[]): React.ReactNode {
//   return nodes.map((node, i) => {
//     if (node.type === "text") {
//       return <React.Fragment key={i}>{node.value}</React.Fragment>;
//     }
//     if (node.type === "element") {
//       const className = node.properties.className || [];
//       return (
//         <Box as="span" key={i} className={className.join(" ")} display="inline">
//           {convertNodeToReactElements(node.children)}
//         </Box>
//       );
//     }
//     return null;
//   });
// }

// function getWeightForClassName(className: string): string {
//   const classesToBold = [
//     "hljs-keyword",
//     "hljs-built_in",
//     "hljs-type",
//     "hljs-function",
//     "hljs-class",
//     "hljs-title",
//   ];

//   return classesToBold.includes(className) ? "bold" : "normal";
// }

// function getStyleForClassName(className: string): string {
//   const classesToItalicize = ["hljs-comment", "hljs-doctag", "hljs-meta"];

//   return classesToItalicize.includes(className) ? "italic" : "normal";
// }
