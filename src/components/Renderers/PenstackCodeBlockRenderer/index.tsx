import { Box, Button, Code, HStack, Stack, Text } from "@chakra-ui/react";

import React, { PropsWithChildren, useState, useCallback } from "react";
import { all, common, createLowlight } from "lowlight";
import { LuCheck, LuClipboard } from "react-icons/lu";
import { DarkMode } from "@/components/ui/color-mode";

const lowlight = createLowlight(common);
interface PenstackCodeBlockRendererProps {
  language: string;
  code: string;
}
export const PenstackCodeBlockRenderer: React.FC<
  PropsWithChildren<PenstackCodeBlockRendererProps>
> = ({ language, code, children }) => {
  const [hasCopied, setHasCopied] = useState(false);
  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  }, [code]);

  const Content = () => {
    try {
      let result;
      if (language) {
        result = lowlight.highlight(language, code);
      } else {
        result = lowlight.highlightAuto(code);
      }

      // Convert the result to React elements
      const codeElements = convertNodeToReactElements(result.children);

      return (
        <Stack className="penstack-code-block" maxW={"full"}>
          <DarkMode>
            <HStack
              justify={"space-between"}
              borderBottom={"1px solid"}
              borderColor={"gray.600"}
              pb={2}
            >
              <Text fontSize="xs" color="gray.400">
                {language}
              </Text>
              <Button
                colorPalette={"gray"}
                variant={"ghost"}
                size={"xs"}
                onClick={onCopy}
              >
                hasCopied ? <LuCheck /> : <LuClipboard />{" "}
                {hasCopied ? "Copied" : "Copy"}
              </Button>
            </HStack>
          </DarkMode>
          <Box
            as="pre"
            whiteSpace={"pre-wrap"}
            fontFamily="monospace"
            position="relative"
          >
            <Box as="code">{codeElements}</Box>
          </Box>
        </Stack>
      );
    } catch (e) {
      // Fallback if highlighting fails
      console.error("Error highlighting code:", e);
      return (
        <Box className="penstack-code-block">
          <Box as="pre">
            <Code whiteSpace="pre-wrap" display="block">
              {code}
            </Code>
          </Box>
        </Box>
      );
    }
  };
  return <Content />;
};
function convertNodeToReactElements(nodes: any[]): React.ReactNode {
  return nodes.map((node, i) => {
    if (node.type === "text") {
      return <React.Fragment key={i}>{node.value}</React.Fragment>;
    }
    if (node.type === "element") {
      const className = node.properties.className || [];
      return (
        <Box as="span" key={i} className={className.join(" ")} display="inline">
          {convertNodeToReactElements(node.children)}
        </Box>
      );
    }
    return null;
  });
}
