"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  IconButton,
  Badge,
  Menu,
  Button,
  Flex,
  Input,
  Select,
  Stack,
  Text,
  Dialog,
  InputGroup,
  InputLeftAddon,
  Field,
  Checkbox,
  VStack,
  HStack,
  Card,
  Avatar,
  Center,
  Switch,
  Textarea,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { toaster } from "@/components/ui/toaster";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PaginatedResponse, RolesSelect, UserSelect } from "@/types";
import axios from "axios";
import Loader from "@/components/Loader";
import DashHeader from "@/components/Dashboard/Header";
import { PageTitleHeader } from "@/components/Dashboard/PageTitleCard";
import {
  LuChevronDown,
  LuPen,
  LuPlus,
  LuSearch,
  LuTrash2,
} from "react-icons/lu";
import { MediaModal } from "@/components/Dashboard/Medias/MediaModal";

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
  const [open, setOpen] = useState(false);
  const [isMediaOpen, setMediaOpen] = useState(false);

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
    setOpen(true);
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

      toaster.create({
        title: currentUser?.id ? "User Updated" : "User Created",
        type: "success",
      });
      setOpen(false);
    } catch (error) {
      toaster.create({
        title: currentUser?.id ? "Error updating User" : "Error creating User",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Bulk actions
  const performBulkAction = (action: string) => {
    // Implement bulk action logic
    toaster.create({
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
        <Card.Root>
          <PageTitleHeader title={"Users"}>
            <Button onClick={() => openUserModal()}>
              <LuPlus /> Add User
            </Button>
          </PageTitleHeader>

          <Card.Body>
            <Stack direction={{ base: "column", md: "row" }} gap={4} mb={6}>
              <InputGroup startElement={<LuSearch />}>
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
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button size="sm">
                      Bulk Actions
                      <LuChevronDown />
                    </Button>
                  </Menu.Trigger>
                  <Menu.Content>
                    <Menu.Item
                      value="delete"
                      onClick={() => performBulkAction("delete")}
                    >
                      Delete Selected
                    </Menu.Item>
                    <Menu.Item
                      value="activate"
                      onClick={() => performBulkAction("activate")}
                    >
                      Activate
                    </Menu.Item>
                    <Menu.Item
                      value="deactivate"
                      onClick={() => performBulkAction("deactivate")}
                    >
                      Deactivate
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Root>
              </HStack>
            )}
            {isFetching ? (
              <Center>
                <Loader />
              </Center>
            ) : (
              <>
                <Table.ScrollArea>
                  <Table.Root variant="simple">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>
                          <Checkbox.Root
                            checked={
                              selectedUsers.length === filteredUsers.length
                            }
                            onChange={selectAllUsers}
                          />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>ID</Table.ColumnHeader>
                        <Table.ColumnHeader>User</Table.ColumnHeader>
                        <Table.ColumnHeader>Email</Table.ColumnHeader>
                        <Table.ColumnHeader>Role</Table.ColumnHeader>
                        <Table.ColumnHeader>Auth Type</Table.ColumnHeader>
                        <Table.ColumnHeader>Created At</Table.ColumnHeader>
                        <Table.ColumnHeader>Actions</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredUsers &&
                        filteredUsers?.length > 0 &&
                        filteredUsers.map((user) => (
                          <Table.Row key={user.id}>
                            <Table.Cell>
                              <Checkbox.Root
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                              />
                            </Table.Cell>
                            <Table.Cell>{user.id}</Table.Cell>
                            <Table.Cell>
                              <Flex align="center">
                                <Avatar.Root
                                  size="sm"
                                  name={user.name}
                                  src={user.avatar || ""}
                                  mr={3}
                                />
                                <Text>{user.name}</Text>
                              </Flex>
                            </Table.Cell>
                            <Table.Cell>{user.email}</Table.Cell>
                            <Table.Cell>
                              <Badge
                                rounded={"lg"}
                                textTransform={"capitalize"}
                                px={2}
                                colorPalette={getRoleColor(user.role_id)}
                              >
                                {getRoleName(user.role_id)}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge
                                variant="outline"
                                rounded={"lg"}
                                textTransform={"capitalize"}
                                px={2}
                                colorPalette="purple"
                              >
                                {user.auth_type}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              {new Date(user.created_at!).toLocaleDateString()}
                            </Table.Cell>
                            <Table.Cell>
                              <HStack>
                                <IconButton
                                  size="sm"
                                  variant="ghost"
                                  aria-label="Edit"
                                  onClick={() => openUserModal(user)}
                                >
                                  <LuPen />
                                </IconButton>
                                <IconButton
                                  aria-label="Delete"
                                  color="red.500"
                                  size="sm"
                                  variant="ghost"
                                >
                                  <LuTrash2 />
                                </IconButton>
                              </HStack>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>
              </>
            )}
          </Card.Body>
        </Card.Root>

        {/* User Create/Edit Dialog */}
        <Dialog.Root open={open} onOpenChange={() => setOpen(false)} size="xl">
          <Dialog.Backdrop />
          <Dialog.Content rounded={"xl"}>
            <Dialog.Header>
              {currentUser?.id ? "Edit User" : "Add New User"}
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4} align={"start"} as={"form"} id="user-form">
                <Field.Root>
                  <Field.Label>Avatar</Field.Label>
                  <HStack>
                    <Avatar.Root
                      src={currentUser?.avatar || ""}
                      name={currentUser?.name}
                      size={"lg"}
                    />
                    <Button size={"sm"} onClick={() => setMediaOpen(true)}>
                      Change Image
                    </Button>
                  </HStack>
                </Field.Root>
                <Field.Root required>
                  <Field.Label>Name</Field.Label>
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
                </Field.Root>
                <Field.Root required>
                  <Field.Label>Email</Field.Label>
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
                </Field.Root>
                <Field.Root required>
                  <Field.Label>Password</Field.Label>
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
                </Field.Root>
                <Field.Root required>
                  <Field.Label>Username</Field.Label>
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
                </Field.Root>

                <Field.Root required>
                  <Field.Label>Role</Field.Label>

                  <Menu.Root>
                    <Menu.Trigger asChild>
                      <Button
                        variant={"ghost"}
                        w="full"
                        colorPalette="gray"
                        textTransform={"capitalize"}
                        justifyContent={"start"}
                        fontWeight={"normal"}
                        textAlign={"left"}
                        border={"1px solid"}
                        borderColor={borderColor}
                      >
                        {getActiveRole()?.name || "Choose role"}
                        <LuChevronDown />
                      </Button>
                    </Menu.Trigger>
                    <Menu.Content rounded={"xl"} px={2} py={2}>
                      {roles &&
                        roles?.length > 0 &&
                        roles?.map((role) => (
                          <Menu.Item
                            key={role.id}
                            value={String(role.id)}
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
                          </Menu.Item>
                        ))}
                    </Menu.Content>
                  </Menu.Root>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Job title</Field.Label>
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
                </Field.Root>
                <Field.Root>
                  <Field.Label>Bio</Field.Label>
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
                </Field.Root>
                <Field.Root w={"full"}>
                  {!currentUser?.id && (
                    <Field.Label
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
                      <Switch.Root />
                    </Field.Label>
                  )}
                </Field.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" mr={3} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                form="user-form"
                onClick={saveUser}
                loading={isUpdating}
                loadingText={currentUser?.id ? "Updating..." : "Creating..."}
              >
                {currentUser?.id ? "Update" : "Create"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      </Box>
      <MediaModal
        multiple={false}
        open={isMediaOpen}
        onOpenChange={() => setMediaOpen(false)}
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
