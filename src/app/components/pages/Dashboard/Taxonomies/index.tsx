"use client";
import React, { useEffect } from "react";
import {
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Input,
  Box,
  Flex,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
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
        <Card>
          <PageTitleHeader title="Taxonomies">
            <Button onClick={handleModalOpen} leftIcon={<LuPlus />}>
              Add New
            </Button>
          </PageTitleHeader>

          <CardBody>
            <Tabs
              isLazy
              defaultIndex={activeTab === "categories" ? 0 : 1}
              onChange={(index) => {
                handleTabChange(index);
              }}
            >
              <TabList>
                <Tab>Categories</Tab>
                <Tab>Tags</Tab>
              </TabList>

              <Box my={4}>
                <Flex align="center" gap={4}>
                  <Box position="relative" flex={1}>
                    <InputGroup>
                      <InputLeftElement>
                        <LuSearch />
                      </InputLeftElement>
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        maxW={"300px"}
                      />
                    </InputGroup>
                  </Box>
                </Flex>
              </Box>

              <TabPanels>
                <TabPanel>
                  <CategoriesPanel />
                </TabPanel>
                <TabPanel>
                  <TagsPanel />
                </TabPanel>
              </TabPanels>
            </Tabs>

            <AddEditForm />
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardTaxonomyPage;
