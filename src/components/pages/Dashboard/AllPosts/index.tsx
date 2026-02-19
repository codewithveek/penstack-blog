"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  Stack,
  Text,
  Button,
  HStack,
  Badge,
  InputGroup,
  Input,
  Select,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  VStack,
  TableContainer,
  InputLeftElement,
} from "@chakra-ui/react";

import { format } from "date-fns";
import Link from "next/link";
import { PermissionGuard } from "../../../PermissionGuard";
import { useAuth } from "@/hooks/useAuth";
import { PaginatedResponse, PostInsert, PostSelect } from "@/types";
import { generatePostUrl, objectToQueryParams } from "@/utils";
import DashHeader from "../../../Dashboard/Header";
import Loader from "../../../Loader";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Pagination from "../../../Pagination";
import { PageTitleHeader } from "../../../Dashboard/PageTitleCard";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  LuExternalLink,
  LuFilePen,
  LuPlus,
  LuSearch,
  LuTrash2,
} from "react-icons/lu";

const PostsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [isCreatingPost, setCreatingPost] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedPost, setSelectedPost] = useState<PostSelect | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast({
    status: "success",
    duration: 3000,
    isClosable: true,
    position: "top",
  });
  const { user } = useAuth();

  const columnHelper = createColumnHelper<PostSelect>();

  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => <Text noOfLines={2}>{info.getValue()}</Text>,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (
        <Badge
          colorScheme={getStatusColor(info.getValue())}
          rounded="md"
          px={2}
          textTransform="capitalize"
        >
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor("author.name", {
      header: "Author",
    }),
    columnHelper.accessor("published_at", {
      header: "Published At",
      cell: (info) =>
        info.getValue()
          ? format(new Date(info.getValue() as Date), "dd/MM/yyyy hh:mm a")
          : "Not published",
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const post = row.original;
        return (
          <HStack spacing={2}>
            <Tooltip label="Preview">
              <IconButton
                icon={<LuExternalLink />}
                as={Link}
                isExternal
                href={"/posts/preview/" + post?.post_id}
                aria-label="Preview"
                size="sm"
                variant="ghost"
              />
            </Tooltip>
            <PermissionGuard
              requiredPermission="posts:edit"
              isOwner={post?.author?.auth_id === user?.id}
            >
              <Tooltip label="Edit">
                <IconButton
                  icon={<LuFilePen />}
                  as={Link}
                  href={`/dashboard/posts/edit/${post?.post_id}`}
                  aria-label="Edit"
                  size="sm"
                  variant="ghost"
                  isExternal
                />
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard requiredPermission="posts:delete">
              <Tooltip label="Delete">
                <IconButton
                  icon={<LuTrash2 />}
                  aria-label="Delete"
                  size="sm"
                  onClick={() => handleDelete(post)}
                  colorScheme="red"
                  variant="ghost"
                />
              </Tooltip>
            </PermissionGuard>
          </HStack>
        );
      },
    }),
  ];

  const fetchPosts = async () => {
    try {
      let url;
      if (searchTerm) {
        url = `/api/posts/search?${objectToQueryParams({
          q: searchTerm,
          page,
          limit,
          status: statusFilter,
          access: "dashboard",
          sortBy,
          sortOrder,
        })}`;
      } else {
        url = `/api/posts?${objectToQueryParams({
          page,
          limit,
          status: statusFilter,
          sortBy,
          sortOrder,
          access: "dashboard",
        })}`;
      }

      const { data } = await axios<PaginatedResponse<PostSelect>>(url);
      return data;
    } catch (error) {
      toast({
        title: "Error fetching posts",
        status: "error",
      });
    }
  };

  const {
    refetch,
    data,
    isPending: loading,
  } = useQuery({
    queryKey: ["posts", page, statusFilter, sortBy, sortOrder],
    queryFn: fetchPosts,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const posts = data?.data;
  const totalPages = data?.meta?.totalPages;

  const table = useReactTable({
    data: posts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        setPage(1);
        refetch();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, refetch]);

  const handleDelete = (post: PostSelect) => {
    setSelectedPost(post);
    onOpen();
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/posts/${selectedPost?.post_id}`);
      toast({
        title: "Post deleted successfully",
      });
      refetch();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error?.message,
        status: "error",
      });
    }
  };

  const getStatusColor = (status: PostInsert["status"]) =>
    ({
      published: "green",
      draft: "gray",
      deleted: "red",
    })[status!] || "gray";

  return (
    <Box>
      <DashHeader />
      <Box p={{ base: 4, md: 5 }}>
        <Card rounded={"lg"} mb={6}>
          <PageTitleHeader title={"Posts"}>
            <Button
              leftIcon={<LuPlus />}
              rounded="md"
              as={Link}
              href="/dashboard/posts/new"
              _hover={{ textDecoration: "none" }}
              isLoading={isCreatingPost}
              onClick={() => {
                setCreatingPost(true);
              }}
            >
              New Post
            </Button>
          </PageTitleHeader>
          <CardBody px={{ base: 3, lg: 4 }}>
            <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6}>
              <InputGroup maxW={{ md: "320px" }} rounded={"md"}>
                <InputLeftElement>
                  <LuSearch />
                </InputLeftElement>
                <Input
                  rounded="md"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                maxW={{ md: "200px" }}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="deleted">Deleted</option>
              </Select>
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                maxW={{ md: "200px" }}
                rounded="md"
              >
                <option value="recent">Recent</option>
                <option value="published_at">Published Date</option>
                <option value="popular">Popular</option>
              </Select>
              <Select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setPage(1);
                }}
                maxW={{ md: "150px" }}
                rounded="md"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Select>
            </Stack>

            {loading && <Loader loadingText={"Loading posts"} />}

            {posts && posts.length > 0 && (
              <>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <Th key={header.id}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </Th>
                          ))}
                        </Tr>
                      ))}
                    </Thead>
                    <Tbody>
                      {table.getRowModel().rows.map((row) => (
                        <Tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <Td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
                <Box mx={"auto"} pt={5}>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages || 1}
                    onPageChange={(newPage) => {
                      setPage(newPage);
                    }}
                  />
                </Box>
              </>
            )}

            {!loading && !posts?.length && (
              <VStack justify="center" h="200px">
                <Text color="gray.400" fontWeight={500} fontSize={"large"}>
                  No posts found
                </Text>
              </VStack>
            )}
          </CardBody>
        </Card>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Post</ModalHeader>
            <ModalBody>
              Are you sure you want to delete &apos;{selectedPost?.title}&apos;?
              This action cannot be undone.
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default PostsDashboard;
