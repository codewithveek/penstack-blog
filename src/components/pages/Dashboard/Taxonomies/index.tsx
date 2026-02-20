"use client";

import { Card, Tabs, Button, Input, Box, Flex, Group, InputElement } from "@chakra-ui/react";
import React, { useEffect } from "react";

import { LuSearch, LuPlus } from "react-icons/lu";
import { PageTitleHeader } from "@/components//Dashboard/PageTitleCard";
import DashHeader from "@/components//Dashboard/Header";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useTaxonomiesStore } from "./state";
import { CategoriesPanel } from "./CategoriesPanel";
import { TagsPanel } from "./TagsPanel";
import { AddEditForm } from "./AddEditForm";

const DashboardTaxonomyPage: React.FC = () => {
  const setType = useTaxonomiesStore((state) => state.setType);
  const setisItemModalOpen = useTaxonomiesStore(
    (state) => state.setIsItemModalOpen
  );
  const searchTerm = useTaxonomiesStore((state) => state.searchTerm);
  const setSearchTerm = useTaxonomiesStore((state) => state.setSearchTerm);

  const tabsOptions = ["categories", "tags"] as const;
  const [activeTab, setActiveTab] = useQueryState(
    "tab",
    parseAsStringLiteral(tabsOptions).withDefault("categories")
  );
  function handleTabChange(index: number) {
    setActiveTab(tabsOptions[index]);
    setSearchTerm("");
  }
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  const handleModalOpen = (): void => {
    setisItemModalOpen(true);
  };
  useEffect(() => {
    setType(activeTab);
  }, [activeTab, setType]);
  return (
    <Box>
      <DashHeader />
      <Box p={{ base: 4, md: 5 }}>
        <Card.Root>
          <PageTitleHeader title="Taxonomies">
            <Button onClick={handleModalOpen}><LuPlus /> Add New</Button>
          </PageTitleHeader>

          <Card.Body>
            <Tabs.Root
              isLazy
              defaultIndex={activeTab === "categories" ? 0 : 1}
              onChange={(index) => {
                handleTabChange(index);
              }}
            >
              <Tabs.List>
                <Tabs.Trigger>Categories</Tabs.Trigger>
                <Tabs.Trigger>Tags</Tabs.Trigger>
              </Tabs.List>

              <Box my={4}>
                <Flex align="center" gap={4}>
                  <Box position="relative" flex={1}>
                    <Group>
                      <InputElement placement="start">
                        <LuSearch />
                      </InputElement>
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        maxW={"300px"}
                      />
                    </Group>
                  </Box>
                </Flex>
              </Box>

              <Tabs.ContentGroup>
                <Tabs.Content>
                  <CategoriesPanel />
                </Tabs.Content>
                <Tabs.Content>
                  <TagsPanel />
                </Tabs.Content>
              </Tabs.ContentGroup>
            </Tabs.Root>

            <AddEditForm />
          </Card.Body>
        </Card.Root>
      </Box>
    </Box>
  );
};

export default DashboardTaxonomyPage;
