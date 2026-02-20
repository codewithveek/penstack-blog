import { Box, Button, HStack, Icon, Menu, NativeSelect, Stack } from "@chakra-ui/react";

import { NodeViewProps } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { memo, useMemo } from "react";
import { LuChevronDown } from "react-icons/lu";

import { FixedSizeList } from "react-window";
import { DarkMode, useColorModeValue } from "@/components/ui/color-mode";

interface PenstackCodeblockComponentProps extends NodeViewProps {}

export const PenstackCodeblockComponent: React.FC<
  PenstackCodeblockComponentProps
> = ({
  updateAttributes,
  node: {
    attrs: { language: defaultLanguage },
  },
  extension,
}) => {
  const languages = useMemo(
    () => extension.options.lowlight.listLanguages(),
    []
  );
  const heights = useMemo(
    () => ({
      itemHeight: 30,
      listHeight: 280,
    }),
    []
  );
  const LanguageRow = memo(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const item = languages[index];
      const hoverBg = useColorModeValue("brand.100", "brand.500");
      const hoverColor = useColorModeValue("black", "white");

      return (
        <Menu.Item
          value={item}
          rounded="full"
          bg={defaultLanguage === item ? "brand.500" : ""}
          color={defaultLanguage === item ? "white" : ""}
          _hover={{
            bg: hoverBg,
            color: hoverColor,
          }}
          onClick={() => updateAttributes({ language: item })}
          style={{ ...style, marginTop: "8px" }}
        >
          {item}
        </Menu.Item>
      );
    }
  );
  LanguageRow.displayName = "LanguageRow";
  return (
    <Stack
      as={NodeViewWrapper}
      className="penstack-code-block"
      spellCheck="false"
    >
      <HStack justify={"flex-end"} p={0}>
        <Menu.Root>
          {({ isOpen }) => (
            <>
              <DarkMode>
                <Menu.Trigger asChild>
                  <Button
                    variant={"ghost"}
                    colorPalette="gray"
                    size={"xs"}
                  >
                    {defaultLanguage || "auto"}
                    <LuChevronDown
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </Button>
                </Menu.Trigger>
              </DarkMode>
              <Menu.Content maxH={heights.listHeight} px={2}>
                <FixedSizeList
                  height={heights.listHeight}
                  itemCount={languages?.length}
                  itemSize={heights.itemHeight}
                  width="100%"
                >
                  {LanguageRow}
                </FixedSizeList>
              </Menu.Content>
            </>
          )}
        </Menu.Root>
      </HStack>
      <Box as="pre">
        <NodeViewContent as="code" />
      </Box>
    </Stack>
  );
};
export default memo(PenstackCodeblockComponent);
