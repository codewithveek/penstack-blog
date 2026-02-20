import { Box, Button, HStack, Menu, Stack } from "@chakra-ui/react";

import { NodeViewProps } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import React, { PropsWithChildren } from "react";
import { memo, useEffect, useMemo, useState } from "react";
import {
  LuCheckCheck,
  LuChevronDown,
  LuQuote,
  LuTextQuote,
} from "react-icons/lu";
import {
  LuInfo,
  LuCircleAlert,
  LuCircleCheck,
  LuTriangleAlert,
} from "react-icons/lu";
import { useColorModeValue } from "@/components/ui/color-mode";

interface PenstackBlockquoteRendererProps {
  isEditing?: boolean;
  node: Partial<NodeViewProps["node"]>;
  updateAttributes?: (attrs: Record<string, any>) => void;
}
const PenstackBlockquoteRenderer: React.FC<
  PropsWithChildren<PenstackBlockquoteRendererProps>
> = ({ isEditing = true, node, updateAttributes, children }) => {
  const [selectedVariant, setSelectedVariant] = useState<
    "plain" | "warning" | "info" | "success" | "danger"
  >(node?.attrs?.variant || "plain");
  const blockquoteVariants = useMemo(
    () => ["plain", "warning", "info", "success", "danger"] as const,
    []
  );
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const blockquoteStyles = {
    plain: {
      bg: useColorModeValue("gray.100", "whiteAlpha.200"),
      icon: LuQuote,
      iconColor: useColorModeValue("gray.500", "gray.200"),
    },
    warning: {
      bg: useColorModeValue("orange.100", "orange.900"),
      icon: LuTriangleAlert,
      iconColor: useColorModeValue("orange.500", "orange.200"),
    },
    info: {
      bg: useColorModeValue("blue.100", "blue.900"),
      icon: LuInfo,
      iconColor: useColorModeValue("blue.500", "blue.200"),
    },
    success: {
      bg: useColorModeValue("green.50", "green.900"),
      icon: LuCheckCheck,
      iconColor: useColorModeValue("green.500", "green.200"),
    },
    danger: {
      bg: useColorModeValue("red.100", "red.900"),
      icon: LuCircleAlert,
      iconColor: useColorModeValue("red.500", "red.200"),
    },
  };

  const blockquote = (
    <Box
      as="blockquote"
      p={4}
      my={isEditing ? 0 : 4}
      rounded={"lg"}
      roundedTop={isEditing ? 0 : "lg"}
      bg={blockquoteStyles[selectedVariant].bg}
    >
      <HStack align="flex-start" gap={3} fontWeight={500}>
        {blockquoteStyles[selectedVariant].icon && (
          <Box color={blockquoteStyles[selectedVariant]?.iconColor} mt={1}>
            {React.createElement(blockquoteStyles[selectedVariant].icon, {
              size: 20,
            })}
          </Box>
        )}
        <Box flex={1}>{isEditing ? <NodeViewContent /> : children}</Box>
      </HStack>
    </Box>
  );
  return (
    <>
      {isEditing ? (
        <>
          <Stack gap={0} my={6}>
            <HStack
              justify={"flex-end"}
              roundedTop={"lg"}
              contentEditable={false}
              border={"1px solid"}
              borderColor={borderColor}
            >
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button
                    variant={"ghost"}
                    textTransform={"capitalize"}
                    size={"xs"}
                  >
                    {selectedVariant}
                    <LuChevronDown />
                  </Button>
                </Menu.Trigger>
                <Menu.Content>
                  {blockquoteVariants.map((variant) => (
                    <Menu.Item
                      key={variant}
                      onClick={() => {
                        updateAttributes?.({
                          variant,
                        });
                        setSelectedVariant(variant);
                      }}
                    >
                      {variant}
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Root>
            </HStack>
            {blockquote}
          </Stack>
        </>
      ) : (
        blockquote
      )}
    </>
  );
};
export default memo(PenstackBlockquoteRenderer);
