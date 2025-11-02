"use client";

import { type ComponentProps, type ReactNode, useState } from "react";
import {
  Box,
  Card,
  HStack,
  IconButton,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";

type SectionCardProps = {
  title: string;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  isOpen?: boolean;
} & Omit<ComponentProps<typeof Card>, "title">;

export function SectionCard({
  children,
  header,
  footer,
  title,
  isOpen = true,
  ...props
}: SectionCardProps) {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("white", "gray.800");
  const [isCardOpen, setIsCardOpen] = useState(isOpen);
  const toggleCard = () => setIsCardOpen(!isCardOpen);

  return (
    <Card {...props}>
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
              icon={
                isCardOpen ? (
                  <LuChevronUp size={20} />
                ) : (
                  <LuChevronDown size={20} />
                )
              }
              variant={"ghost"}
            />
          </HStack>
        </HStack>
      )}
      {isCardOpen && children}

      {isCardOpen && footer && (
        <HStack
          spacing={4}
          mt={4}
          borderTop={"1px"}
          borderTopColor={borderColor}
          px={4}
          py={3}
        >
          {footer}
        </HStack>
      )}
    </Card>
  );
}
