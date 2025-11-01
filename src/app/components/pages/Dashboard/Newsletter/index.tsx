"use client";
import {
  Box,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  TableContainer,
  Text,
  Input,
  InputGroup,
  Stack,
  Center,
  Tooltip,
  useColorModeValue,
  ResponsiveValue,
  InputLeftElement,
  HStack,
  Tag,
} from "@chakra-ui/react";
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
          <Card>
            <PageTitleHeader title="Newsletter" />

            <CardBody>
              <Stack
                direction={{ base: "column", md: "row" }}
                spacing={4}
                mb={6}
              >
                <InputGroup>
                  <InputLeftElement>
                    <LuSearch />
                  </InputLeftElement>
                  <Input
                    maxW={{ md: "320px" }}
                    autoComplete="off"
                    placeholder="Search subscribers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Stack>

              {isFetching && (
                <Center>
                  <Loader />
                </Center>
              )}

              {!isFetching && filteredNewsletters?.length > 0 ? (
                <>
                  <TableContainer>
                    <Table mb={3} style={{ fontVariantNumeric: "normal" }}>
                      <Thead
                        px={4}
                        py={4}
                        mb={3}
                        h={"50px"}
                        rounded="lg"
                        fontWeight="medium"
                        fontSize="medium"
                        style={{ textTransform: "none" }}
                      >
                        <Tr>
                          <Th {...thStyles}>Id</Th>
                          <Th {...thStyles}>Email</Th>
                          <Th {...thStyles}>Name</Th>
                          <Th {...thStyles}>Status</Th>
                          <Th {...thStyles}>Verification</Th>
                          <Th {...thStyles}>Referrer</Th>
                          <Th {...thStyles}>Created At</Th>
                        </Tr>
                      </Thead>
                      <Tbody borderColor={headerColor}>
                        {filteredNewsletters &&
                          filteredNewsletters.map((subscriber) => (
                            <Tr key={subscriber.id}>
                              <Td color={cellTextColor}>{subscriber.id}</Td>
                              <Td>{subscriber.email}</Td>
                              <Td>{subscriber.name || "-"}</Td>
                              <Td>
                                <Tag
                                  size="sm"
                                  // bg={"transparent"}
                                  textTransform={"capitalize"}
                                  colorScheme={
                                    subscriber.status === "subscribed"
                                      ? "green"
                                      : "red"
                                  }
                                >
                                  {subscriber.status}
                                </Tag>
                              </Td>
                              <Td>
                                <Tag
                                  size="sm"
                                  textTransform={"capitalize"}
                                  // bg={"transparent"}
                                  colorScheme={
                                    subscriber.verification_status ===
                                    "verified"
                                      ? "green"
                                      : "yellow"
                                  }
                                >
                                  {subscriber.verification_status}
                                </Tag>
                              </Td>
                              <Td>
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
                              </Td>
                              <Td>
                                <Text
                                  color={cellTextColor}
                                  textTransform={"lowercase"}
                                >
                                  {format(
                                    new Date(subscriber.created_at as Date),
                                    "dd/MM/yyyy hh:mm a"
                                  )}
                                </Text>
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
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
            </CardBody>
          </Card>
        </Box>
      </Box>
    </PermissionGuard>
  );
};
