import { Box, HStack, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { TimePicker as ReactTimePicker } from "react-time-picker";

export const TimePicker = ({
  value,
  onChange,
}: {
  value: string | Date;
  onChange: (value: string | null) => void;
}) => {
  return (
    <Stack gap={0}>
      <Text
        as={"span"}
        fontWeight={500}
        size={"sm"}
        color={useColorModeValue("gray.500", "gray.400")}
      >
        Time:
      </Text>
      <Box
        sx={{
          ".react-time-picker__wrapper": { display: "flex" },
          input: {
            border: 0,
            outline: "none",
            backgroundColor: "transparent",
            color: "gray.500",
            fontWeight: "bold",
            fontSize: "14px",
            fontFamily: "inherit",
            width: "100%",
            "&:focus": {
              outline: "none",
              boxShadow: "none",
              border: "none",
              backgroundColor: "transparent",
            },
            "&:hover": {
              backgroundColor: "transparent",
              color: "gray.500",
              border: "none",
              boxShadow: "none",
            },
            "&:active": {
              backgroundColor: "transparent",
              color: "gray.500",
              border: "none",
              boxShadow: "none",
            },
            "&:focus-visible": {
              outline: "none",
              boxShadow: "none",
              border: "none",
              backgroundColor: "transparent",
            },
            "&:focus-within": {
              outline: "none",
              boxShadow: "none",
              border: "none",
              backgroundColor: "transparent",
            },
          },
        }}
        as={ReactTimePicker}
        px={3}
        py={1}
        display={"flex"}
        rounded={"full"}
        value={value}
        ring={1}
        ringColor={"brand.500"}
        format="h:mm a"
        onChange={onChange}
        clockIcon={null}
        clearIcon={null}
        shouldOpenClock={() => false}
      />
    </Stack>
  );
};
