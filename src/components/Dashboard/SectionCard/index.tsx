"use client";

import { Box, Card, HStack, IconButton, Text } from "@chakra-ui/react";

import { type ComponentProps, type ReactNode, useState } from "react";

import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { useColorModeValue } from "@/components/ui/color-mode";

type SectionCardProps = {
  title: string;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  isOpen?: boolean;
  roundedTop?: string;
} & Omit<ComponentProps<typeof Card.Root>, "title">;

export function SectionCard({
  children,
  header,
  footer,
  title,
  isOpen = true,
  roundedTop,
  ...props
}: SectionCardProps) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.800");
  const [isCardOpen, setIsCardOpen] = useState(isOpen);
  const toggleCard = () => setIsCardOpen(!isCardOpen);

  return (
    <Card.Root
      {...props}
      style={{
        ...(roundedTop
          ? {
              borderTopLeftRadius: roundedTop,
              borderTopRightRadius: roundedTop,
            }
          : {}),
        ...(props.style || {}),
      }}
    >
      {(header || title) && (
        <HStack
          justify={"space-between"}
          borderBottomWidth={isCardOpen ? "1px" : "0"}
          px={4}
          py={2}
          borderBottomColor={borderColor}
        >
          {title && (
            <Text as={"span"} fontSize={"16px"} fontWeight={500}>
              {title}
            </Text>
          )}
          <HStack gap={2}>
            {header}
            <IconButton
              size={"xs"}
              onClick={() => toggleCard()}
              aria-label="toggle card"
              variant={"ghost"}
            >
              {isCardOpen ? (
                <LuChevronUp size={20} />
              ) : (
                <LuChevronDown size={20} />
              )}
            </IconButton>
          </HStack>
        </HStack>
      )}
      {isCardOpen && children}

      {isCardOpen && footer && (
        <HStack
          gap={4}
          mt={4}
          borderTop={"1px"}
          borderTopColor={borderColor}
          px={4}
          py={3}
        >
          {footer}
        </HStack>
      )}
    </Card.Root>
  );
}
