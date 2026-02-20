"use client";

import {
  Box,
  Card,
  Table,
  Badge,
  Text,
  Input,
  Group,
  Stack,
  Center,
  ResponsiveValue,
  InputElement,
  HStack,
  Tag,
} from "@chakra-ui/react";

import { Tooltip } from "@/components/ui/tooltip";
import { PermissionGuard } from "../../../PermissionGuard";
import { LuSearch } from "react-icons/lu";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import Loader from "../../../Loader";
import { NewsletterSelect, PaginatedResponse } from "@/types";
import { format } from "date-fns";
import { shortenText } from "@/utils";
import DashHeader from "../../../Dashboard/Header";
import { PageTitleHeader } from "../../../Dashboard/PageTitleCard";
import Pagination from "../../../Pagination";
import { useColorModeValue } from "@/components/ui/color-mode";

export const DashboardNewsletterPage = () => {
  const [newsletters, setNewsletters] = useState<NewsletterSelect[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredNewsletters, setFilteredNewsletters] = useState<
    NewsletterSelect[]
  >([]);

  const { isFetching, data, refetch } = useQuery({
    queryKey: ["newsletters"],
    queryFn: async () => {
      const { data } =
        await axios<PaginatedResponse<NewsletterSelect>>("/api/newsletters");
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (data) {
      setNewsletters(data.data);
    }
  }, [data]);

  useEffect(() => {
    if (newsletters) {
      const filtered = newsletters.filter((newsletter) => {
        const matchesSearch =
          newsletter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          newsletter.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      });
      setFilteredNewsletters(filtered);
    }
  }, [newsletters, searchTerm]);
  const headerColor = useColorModeValue("gray.500", "gray.500");
  const cellTextColor = useColorModeValue("gray.500", "gray.400");
  const thStyles = {
    textTransform: "capitalize" as ResponsiveValue<"capitalize">,
    fontSize: "medium",
    fontWeight: "normal",
    color: headerColor,
  };
  return (
    <PermissionGuard requiredPermission={"newsletters:read"}>
      <Box>
        <DashHeader />
        <Box p={{ base: 4, md: 5 }}>
          <Card.Root>
            <PageTitleHeader title="Newsletter" />

            <Card.Body>
              <Stack direction={{ base: "column", md: "row" }} gap={4} mb={6}>
                <Group>
                  <InputElement placement="start">
                    <LuSearch />
                  </InputElement>
                  <Input
                    maxW={{ md: "320px" }}
                    autoComplete="off"
                    placeholder="Search subscribers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Group>
              </Stack>

              {isFetching && (
                <Center>
                  <Loader />
                </Center>
              )}

              {!isFetching && filteredNewsletters?.length > 0 ? (
                <>
                  <Table.ScrollArea>
                    <Table.Root mb={3} style={{ fontVariantNumeric: "normal" }}>
                      <Table.Header
                        px={4}
                        py={4}
                        mb={3}
                        h={"50px"}
                        rounded="lg"
                        fontWeight="medium"
                        fontSize="medium"
                        style={{ textTransform: "none" }}
                      >
                        <Table.Row>
                          <Table.ColumnHeader {...thStyles}>
                            Id
                          </Table.ColumnHeader>
                          <Table.ColumnHeader {...thStyles}>
                            Email
                          </Table.ColumnHeader>
                          <Table.ColumnHeader {...thStyles}>
                            Name
                          </Table.ColumnHeader>
                          <Table.ColumnHeader {...thStyles}>
                            Status
                          </Table.ColumnHeader>
                          <Table.ColumnHeader {...thStyles}>
                            Verification
                          </Table.ColumnHeader>
                          <Table.ColumnHeader {...thStyles}>
                            Referrer
                          </Table.ColumnHeader>
                          <Table.ColumnHeader {...thStyles}>
                            Created At
                          </Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body borderColor={headerColor}>
                        {filteredNewsletters &&
                          filteredNewsletters.map((subscriber) => (
                            <Table.Row key={subscriber.id}>
                              <Table.Cell color={cellTextColor}>
                                {subscriber.id}
                              </Table.Cell>
                              <Table.Cell>{subscriber.email}</Table.Cell>
                              <Table.Cell>{subscriber.name || "-"}</Table.Cell>
                              <Table.Cell>
                                <Tag.Root
                                  size="sm"
                                  // bg={"transparent"}
                                  textTransform={"capitalize"}
                                  colorPalette={
                                    subscriber.status === "subscribed"
                                      ? "green"
                                      : "red"
                                  }
                                >
                                  {subscriber.status}
                                </Tag.Root>
                              </Table.Cell>
                              <Table.Cell>
                                <Tag.Root
                                  size="sm"
                                  textTransform={"capitalize"}
                                  // bg={"transparent"}
                                  colorPalette={
                                    subscriber.verification_status ===
                                    "verified"
                                      ? "green"
                                      : "yellow"
                                  }
                                >
                                  {subscriber.verification_status}
                                </Tag.Root>
                              </Table.Cell>
                              <Table.Cell>
                                <Tooltip
                                  hasArrow
                                  label={subscriber.referrer}
                                  rounded={"lg"}
                                >
                                  <Text as="span">
                                    {shortenText(
                                      subscriber.referrer || "-",
                                      20
                                    )}
                                  </Text>
                                </Tooltip>
                              </Table.Cell>
                              <Table.Cell>
                                <Text
                                  color={cellTextColor}
                                  textTransform={"lowercase"}
                                >
                                  {format(
                                    new Date(subscriber.created_at as Date),
                                    "dd/MM/yyyy hh:mm a"
                                  )}
                                </Text>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                      </Table.Body>
                    </Table.Root>
                  </Table.ScrollArea>
                  <HStack py={4} justify={"center"}>
                    <Pagination
                      totalPages={data?.meta.totalPages || 0}
                      currentPage={data?.meta?.page || 1}
                      onPageChange={() => {}}
                    />
                  </HStack>
                </>
              ) : (
                !isFetching && (
                  <Center py={10}>
                    <Text color="gray.500">No subscribers yet</Text>
                  </Center>
                )
              )}
            </Card.Body>
          </Card.Root>
        </Box>
      </Box>
    </PermissionGuard>
  );
};
