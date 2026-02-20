import { HStack, Icon, List, Text } from "@chakra-ui/react";

import { LuRadioReceiver } from "react-icons/lu";

export const StatusItem = ({ status }: { status: string }) => {
  return (
    <HStack>
      <Text as="span" color="gray.500">
        <Icon mr={1}>
          <LuRadioReceiver />
        </Icon>
        Status:
      </Text>
      <Text as="span" fontWeight="semibold" textTransform="capitalize">
        {status}
      </Text>
    </HStack>
  );
};
