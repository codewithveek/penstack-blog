import { Card, HStack, Heading } from "@chakra-ui/react";


import { FC, PropsWithChildren } from "react";
import { useColorModeValue } from "@/components/ui/color-mode";

export const PageTitleHeader: FC<PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  return (
    <Card.Header borderBottom={"1px solid"} borderColor={borderColor}>
      <HStack justify="space-between" align="center">
        <Heading size="md">{title}</Heading>
        {children}
      </HStack>
    </Card.Header>
  );
};
