import { Box, Heading, Text, Flex, Field, Input, Button, Stack, Alert } from "@chakra-ui/react";

import { useState } from "react";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import isEmpty from "just-is-empty";
import { cn } from "@/lib/utils";
import { LightMode, useColorMode, useColorModeValue } from "@/components/ui/color-mode";

export const Newsletter = ({
  title,
  description,
  isDark = true,
  maxW = "xl",
  canWrap,
}: {
  title?: string;
  description?: string;
  maxW?: string | number;
  isDark?: boolean;
  canWrap?: boolean;
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"success" | "error" | "info" | null>(
    null
  );
  const { colorMode } = useColorMode();
  const formWrapBgColor = isDark || colorMode === "dark" ? "gray.900" : "white";
  const formWrapBorderColor =
    isDark || colorMode === "dark" ? "gray.700" : "gray.300";
  const textColor = useColorModeValue("gray.600", "gray.300");
  const borderColor =
    isDark || colorMode === "dark" ? "border-gray-700" : "border-gray-300";
  const headingColor = isDark || colorMode === "dark" ? "white" : "gray.800";

  async function sendVerificationEmail(email: string) {
    try {
      const { data } = await axios.post("/api/newsletters/confirmation/send", {
        email,
      });

      return data;
    } catch (error) {
      throw error;
      console.log(error);
    }
  }
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["newsletter", email],
    mutationFn: async () => {
      try {
        const body = { email: email.toLowerCase() };
        const { data: response } = await axios.post<{
          data: { isSubscribed: boolean; isVerified: boolean };
        }>("/api/newsletters", body);
        const data = response.data;

        if (data.isSubscribed && data.isVerified) {
          setStatus("info");
        } else {
          try {
            await sendVerificationEmail(body.email);
            setStatus("success");
            setEmail("");
          } catch (error) {
            setStatus("error");
            throw error;
          }
        }
        setTimeout(() => {
          setStatus(null);
        }, 10000);
        return data;
      } catch (error) {
        setStatus("error");
        return null;
      }
    },
  });
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (isEmpty(email)) {
        return;
      }
      const data = await mutateAsync();
    } catch (error) {}
  };

  return (
    <Box
      maxW={maxW}
      className={cn("rounded-lg border p-4 w-full", borderColor)}
    >
      <Stack gap={2}>
        {title && (
          <Heading
            size="md"
            color={headingColor}
            fontWeight={500}
            className="text-center"
          >
            {title || "Get Updates"}
          </Heading>
        )}
        {description && (
          <Text color={textColor} className="text-center">
            {description ||
              "Subscribe to our newsletter to get the latest updates."}
          </Text>
        )}
        <Box w={"full"}>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <Flex
              direction={canWrap ? "column" : { base: "column", md: "row" }}
              gap={{ base: 3, md: 1 }}
              border={"1px"}
              borderColor={formWrapBorderColor}
              // maxW="lg"
              bg={formWrapBgColor}
              rounded={"lg"}
              p={1.5}
            >
              <Field.Root flex={1}>
                <Input
                  type="email"
                  p={0}
                  pl={1}
                  rounded={"none"}
                  fontWeight={"normal"}
                  value={email}
                  colorPalette="brandPurple"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  border={"none"}
                  _focus={{
                    outline: "none",
                    boxShadow: "none",
                    borderBottom: "2px solid",
                  }}
                />
              </Field.Root>
              {isDark ? (
                <LightMode>
                  <Button
                    type="submit"
                    loadingText={"Subscribing..."}
                    loading={isPending}
                    disabled={isPending}
                    zIndex={2}
                    fontWeight={500}
                    colorPalette="brandPurple"
                  >
                    Subscribe
                  </Button>
                </LightMode>
              ) : (
                <Button
                  type="submit"
                  loadingText={"Subscribing..."}
                  loading={isPending}
                  disabled={isPending}
                  zIndex={2}
                  fontWeight={500}
                  colorPalette="brandPurple"
                >
                  Subscribe
                </Button>
              )}
            </Flex>
          </form>
        </Box>
        {status && (
          <Alert.Root status={status}>
            <Alert.Title>
              {status === "error" && "Something went wrong...please try again."}
              {status === "info" &&
                "🎉You're already part of the family, thanks."}
              {status === "success" &&
                " 🎉 Welcome aboard! Check your inbox to confirm subscription."}
            </Alert.Title>
          </Alert.Root>
        )}
      </Stack>
    </Box>
  );
};
