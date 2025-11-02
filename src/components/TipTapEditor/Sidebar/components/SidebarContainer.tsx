import { Stack } from "@chakra-ui/react";
import { FC, PropsWithChildren } from "react";

export const SidebarContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Stack
      gap={3}
      flexShrink={0}
      maxW={360}
      minW={300}
      width={{ base: "100%" }}
      overflowY={"auto"}
    >
      {children}
    </Stack>
  );
};
