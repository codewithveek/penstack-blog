import {
  CardHeader,
  HStack,
  Heading,
  useColorModeValue,
} from "@chakra-ui/react";

import { FC, PropsWithChildren } from "react";

export const PageTitleHeader: FC<PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  return (
    <CardHeader borderBottom={"1px solid"} borderColor={borderColor}>
      <HStack justify="space-between" align="center">
        <Heading size="md">{title}</Heading>
        {children}
      </HStack>
    </CardHeader>
  );
};
