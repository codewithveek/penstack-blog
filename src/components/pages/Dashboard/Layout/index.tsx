"use client";
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  DrawerOverlay,
  DrawerBody,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { memo, Suspense } from "react";
import { ReactNode } from "react";
import { DashboardSidebar } from "@/components/Dashboard/Sidebar";
import { LuMenu } from "react-icons/lu";
import NetworkAvailabiltyCheck from "@/components/NetworkAvailabiltyCheck";
import { useSiteConfig } from "@/context/SiteConfig";
import { useDashboardSidebarState } from "@/hooks/useDashboardSidebarState";
import Loader from "@/components/Loader";
import { NavItemWithoutPermission } from "@/types";

export default memo(function DashboardLayout({
  children,
  navLinks,
}: {
  children: ReactNode;
  navLinks: NavItemWithoutPermission[];
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isMinimized, toggleMinimized } = useDashboardSidebarState();
  const siteSettings = useSiteConfig();

  return (
    <NetworkAvailabiltyCheck>
      <Box
        className="home-wrap"
        // minH="var(--chakra-vh)"
        bg={useColorModeValue("gray.100", "charcoalBlack")}
      >
        <Suspense fallback={<Loader />}>
          <DashboardSidebar
            navLinks={navLinks}
            onClose={() => onClose}
            display={{ base: "none", md: "block" }}
            isMinimized={isMinimized}
            toggleMinimized={toggleMinimized}
          />
        </Suspense>
        <Drawer
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size={"xs"}
        >
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton zIndex={2000} />

            <DrawerBody px={0} p={0} mr={0}>
              <Suspense fallback={<Loader />}>
                <DashboardSidebar
                  navLinks={navLinks}
                  onClose={onClose}
                  isMinimized={false}
                  toggleMinimized={() => {}}
                />
              </Suspense>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        {/* mobilenav */}
        <Flex
          ml={{
            base: 0,
            md: isMinimized
              ? "var(--dash-sidebar-mini-w)"
              : "var(--dash-sidebar-w)",
          }}
          px={{ base: 4, md: 16 }}
          h={"var(--dash-header-h)"}
          alignItems="center"
          borderBottomWidth="1px"
          borderBottomColor={useColorModeValue("gray.200", "gray.700")}
          justifyContent="flex-start"
          display={{ base: "flex", md: "none" }}
        >
          <Icon as={LuMenu} onClick={onOpen} fontSize="20" cursor="pointer" />
          <Text fontSize="lg" ml="4" fontWeight="bold" letterSpacing={1}>
            {siteSettings?.siteName?.value}
          </Text>
        </Flex>
        <Flex flexDir={"column"} h={"var(--chakra-vh)"}>
          {/* Dashboard Header */}

          <Box
            flex={1}
            w={{
              base: "100%",
              md: isMinimized
                ? "calc(100% - var(--dash-sidebar-mini-w))"
                : "calc(100% - var(--dash-sidebar-w))",
            }}
            ml={{
              base: 0,
              md: isMinimized
                ? "var(--dash-sidebar-mini-w)"
                : "var(--dash-sidebar-w)",
            }}
            maxW="container.2xl"
            margin="0 auto"
            overflowY={"auto"}
            h={"full"}
          >
            {children}
          </Box>
        </Flex>
      </Box>
    </NetworkAvailabiltyCheck>
  );
});
