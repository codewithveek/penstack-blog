"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useToast,
  Flex,
  Input,
  Select,
  Stack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroup,
  InputLeftAddon,
  FormControl,
  FormLabel,
  Checkbox,
  CheckboxGroup,
  VStack,
  HStack,
  Card,
  CardBody,
  Avatar,
  TableContainer,
  useColorModeValue,
  Center,
  Switch,
  InputLeftElement,
  Textarea,
} from "@chakra-ui/react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginatedResponse, RolesSelect, UserSelect } from "@/types";
import axios from "axios";
import Loader from "../../../Loader";
import DashHeader from "../../../Dashboard/Header";
import { PageTitleHeader } from "../../../Dashboard/PageTitleCard";
import {
  LuChevronDown,
  LuFileEdit,
  LuPlus,
  LuSearch,
  LuTrash2,
} from "react-icons/lu";
import { MediaModal } from "../../../Dashboard/Medias/MediaModal";

const UsersDashboard = () => {
  const [users, setUsers] = useState<UserSelect[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedRole, setSelectedRole] = useState<RolesSelect | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [filteredUsers, setFilteredUsers] = useState<UserSelect[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<UserSelect> | null>(
    null
  );
  const queryClient = useQueryClient();
  const borderColor = useColorModeValue("gray.200", "gray.500");
  const roleTextColor = useColorModeValue("gray.600", "gray.300");
  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await axios.get<{ data: RolesSelect[] }>("/api/roles");
      return data.data;
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const { isFetching, data, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios<PaginatedResponse<UserSelect>>("/api/users");

      return data;
    },

    staleTime: 1000 * 60 * 60, // 1 hour
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isMediaOpen,
    onOpen: onMediaOpen,
    onClose: onMediaClose,
  } = useDisclosure();
  const toast = useToast({
    position: "top",
    duration: 3000,
  });

  useEffect(() => {
    if (data) {
      setUsers(data.data);
    }
  }, [data]);

  // Filter users
  useEffect(() => {
    if (users) {
      const filtered = users.filter((user) => {
        const matchesSearch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole =
          roleFilter === "all" || user.role_id.toString() === roleFilter;
        return matchesSearch && matchesRole;
      });
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm, roleFilter]);

  // Handle user selection
  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map((user) => user.id)
    );
  };

  // Open modal for create/edit
  const openUserModal = (user?: UserSelect) => {
    setCurrentUser(user || {});
    onOpen();
  };

  // Save user
  const saveUser = async () => {
    try {
      setIsUpdating(true);
      if (currentUser?.id) {
        await axios.patch(`/api/users/${currentUser?.auth_id}`, currentUser);

        queryClient.invalidateQueries({
          queryKey: ["users"],
          refetchType: "all",
        });
      } else {
        await axios.post("/api/users", currentUser);
        queryClient.invalidateQueries({
          queryKey: ["users"],
          refetchType: "all",
        });
      }

      toast({
        title: currentUser?.id ? "User Updated" : "User Created",
        status: "success",
      });
      onClose();
    } catch (error) {
      toast({
        title: currentUser?.id ? "Error updating User" : "Error creating User",
        status: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk actions
  const performBulkAction = (action: string) => {
    // Implement bulk action logic
    toast({
      title: `Performed ${action} on ${selectedUsers.length} users`,
      status: "info",
    });
    setSelectedUsers([]);
  };
  function getActiveRole() {
    let activeRole;
    if (currentUser) {
      activeRole = roles?.find((role) => currentUser?.role_id === role.id);
    } else if (selectedRole) {
      activeRole = selectedRole;
    } else {
      activeRole = roles?.[0];
    }
    return activeRole;
  }
  function getRoleName(roleId: number) {
    return roles?.find((role) => roleId === role.id)?.name;
  }
  function getRoleColor(roleId: number) {
    switch (roleId) {
      case 1:
        return "red";
      case 2:
        return "brand";
      case 3:
        return "yellow";
      case 4:
        return "teal";
      case 5:
        return "orange";
      case 6:
        return "green";
      default:
        return "gray";
    }
  }
  return (
    <Box>
      <DashHeader />
      <Box p={{ base: 4, md: 5 }}>
        <Card>
          <PageTitleHeader title={"Users"}>
            <Button leftIcon={<LuPlus />} onClick={() => openUserModal()}>
              Add User
            </Button>
          </PageTitleHeader>

          <CardBody>
            <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6}>
              <InputGroup>
                <InputLeftElement>
                  <LuSearch />
                </InputLeftElement>
                <Input
                  maxW={{ md: "320px" }}
                  autoComplete="off"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                maxW={{ md: "300px" }}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </Stack>

            {selectedUsers.length > 0 && (
              <HStack mb={4}>
                <Text>{selectedUsers.length} users selected</Text>
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<LuChevronDown />}
                    size="sm"
                  >
                    Bulk Actions
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => performBulkAction("delete")}>
                      Delete Selected
                    </MenuItem>
                    <MenuItem onClick={() => performBulkAction("activate")}>
                      Activate
                    </MenuItem>
                    <MenuItem onClick={() => performBulkAction("deactivate")}>
                      Deactivate
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            )}
            {isFetching ? (
              <Center>
                <Loader />
              </Center>
            ) : (
              <>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>
                          <Checkbox
                            isChecked={
                              selectedUsers.length === filteredUsers.length
                            }
                            onChange={selectAllUsers}
                          />
                        </Th>
                        <Th>ID</Th>
                        <Th>User</Th>
                        <Th>Email</Th>
                        <Th>Role</Th>
                        <Th>Auth Type</Th>
                        <Th>Created At</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredUsers &&
                        filteredUsers?.length > 0 &&
                        filteredUsers.map((user) => (
                          <Tr key={user.id}>
                            <Td>
                              <Checkbox
                                isChecked={selectedUsers.includes(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                              />
                            </Td>
                            <Td>{user.id}</Td>
                            <Td>
                              <Flex align="center">
                                <Avatar
                                  size="sm"
                                  name={user.name}
                                  src={user.avatar || ""}
                                  mr={3}
                                />
                                <Text>{user.name}</Text>
                              </Flex>
                            </Td>
                            <Td>{user.email}</Td>
                            <Td>
                              <Badge
                                rounded={"lg"}
                                textTransform={"capitalize"}
                                px={2}
                                colorScheme={getRoleColor(user.role_id)}
                              >
                                {getRoleName(user.role_id)}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge
                                variant="outline"
                                rounded={"lg"}
                                textTransform={"capitalize"}
                                px={2}
                                colorScheme="purple"
                              >
                                {user.auth_type}
                              </Badge>
                            </Td>
                            <Td>
                              {new Date(user.created_at!).toLocaleDateString()}
                            </Td>
                            <Td>
                              <HStack>
                                <IconButton
                                  icon={<LuFileEdit />}
                                  size="sm"
                                  variant="ghost"
                                  aria-label="Edit"
                                  onClick={() => openUserModal(user)}
                                ></IconButton>
                                <IconButton
                                  aria-label="Delete"
                                  icon={<LuTrash2 />}
                                  color="red.500"
                                  size="sm"
                                  variant="ghost"
                                >
                                  Delete
                                </IconButton>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </>
            )}
          </CardBody>
        </Card>

        {/* User Create/Edit Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent rounded={"xl"}>
            <ModalHeader>
              {currentUser?.id ? "Edit User" : "Add New User"}
            </ModalHeader>
            <ModalBody>
              <VStack spacing={4} align={"start"} as={"form"} id="user-form">
                <FormControl>
                  <FormLabel>Avatar</FormLabel>
                  <HStack>
                    <Avatar
                      src={currentUser?.avatar || ""}
                      name={currentUser?.name}
                      size={"lg"}
                    />
                    <Button size={"sm"} onClick={() => onMediaOpen()}>
                      Change Image
                    </Button>
                  </HStack>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    autoComplete="off"
                    placeholder="Enter full name"
                    type="text"
                    name="name"
                    value={currentUser?.name || ""}
                    onChange={(e) =>
                      setCurrentUser((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    placeholder="Enter email"
                    type="email"
                    name="email"
                    autoComplete="off"
                    value={currentUser?.email || ""}
                    onChange={(e) =>
                      setCurrentUser((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    placeholder="Enter password"
                    type="password"
                    name="password"
                    autoComplete="off"
                    value={currentUser?.password || ""}
                    onChange={(e) =>
                      setCurrentUser((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    autoComplete="off"
                    placeholder="Username"
                    type="text"
                    name="username"
                    value={currentUser?.username || ""}
                    onChange={(e) =>
                      setCurrentUser((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Role</FormLabel>

                  <Menu>
                    <MenuButton
                      as={Button}
                      variant={"ghost"}
                      w="full"
                      colorScheme="gray"
                      textTransform={"capitalize"}
                      rightIcon={<LuChevronDown />}
                      justifyContent={"start"}
                      fontWeight={"normal"}
                      textAlign={"left"}
                      border={"1px solid"}
                      borderColor={borderColor}
                    >
                      {getActiveRole()?.name || "Choose role"}
                    </MenuButton>
                    <MenuList rounded={"xl"} px={2} py={2}>
                      {roles &&
                        roles?.length > 0 &&
                        roles?.map((role) => (
                          <MenuItem
                            key={role.id}
                            textTransform={"capitalize"}
                            onClick={() => {
                              setSelectedRole(role);
                              setCurrentUser((prev) => ({
                                ...prev,
                                role_id: role.id,
                              }));
                            }}
                          >
                            <HStack justify={"space-between"} gap={4}>
                              <Text>{role?.name}</Text>
                              <Text
                                as={"span"}
                                fontSize={"smaller"}
                                color={roleTextColor}
                              >
                                {role?.description}
                              </Text>
                            </HStack>
                          </MenuItem>
                        ))}
                    </MenuList>
                  </Menu>
                </FormControl>
                <FormControl>
                  <FormLabel>Job title</FormLabel>
                  <Input
                    autoComplete="off"
                    placeholder="Job Title"
                    type="text"
                    name="title"
                    value={currentUser?.title || ""}
                    onChange={(e) =>
                      setCurrentUser((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Textarea
                    autoComplete="off"
                    placeholder="Tell us about yourself"
                    rows={4}
                    maxH={200}
                    name="bio"
                    value={currentUser?.bio || ""}
                    onChange={(e) =>
                      setCurrentUser((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl w={"full"}>
                  {!currentUser?.id && (
                    <FormLabel
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Stack gap={0}>
                        <Text>Notify User</Text>
                        <Text
                          fontSize={"small"}
                          color={"gray.500"}
                          fontWeight={400}
                        >
                          Sends an email with the account details to user.
                        </Text>
                      </Stack>
                      <Switch />
                    </FormLabel>
                  )}
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                form="user-form"
                onClick={saveUser}
                isLoading={isUpdating}
                loadingText={currentUser?.id ? "Updating..." : "Creating..."}
              >
                {currentUser?.id ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
      <MediaModal
        multiple={false}
        isOpen={isMediaOpen}
        onClose={onMediaClose}
        maxSelection={1}
        onSelect={(media) => {
          if (!Array.isArray(media)) {
            setCurrentUser((prev) => ({
              ...prev,
              avatar: media?.url,
            }));
          }
        }}
      />
    </Box>
  );
};

export default UsersDashboard;
