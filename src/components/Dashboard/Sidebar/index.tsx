"use client";

import {
  Box,
  Flex,
  VStack,
  Stack,
  IconButton,
  Link as ChakraLink,
} from "@chakra-ui/react";

import { LuChevronsLeft, LuChevronsRight } from "react-icons/lu";
import { LightDarkModeSwitch } from "../../LightDarkModeSwitch";
import { AppLogo } from "../../AppLogoAndName/AppLogo";
import { SidebarNavItem } from "./NavItem";
import { NavItemWithChildren } from "./NavItemWithDropdown";
import { AppLogoAndName } from "../../AppLogoAndName";
import { useSiteConfig } from "@/context/SiteConfig";
import Link from "next/link";
import { processedNavLinksWithIcons } from "@/lib/dashboard/nav-links";
import { NavItemWithoutPermission } from "@/types";
import { useColorModeValue } from "@/components/ui/color-mode";

export const DashboardSidebar = ({
  onClose,
  isMinimized,
  toggleMinimized,
  navLinks,
  ...rest
}: {
  onClose: () => void;
  isMinimized: boolean;
  toggleMinimized: () => void;
  navLinks: NavItemWithoutPermission[];
  [key: string]: any;
}) => {
  const processedNavLinks = processedNavLinksWithIcons(navLinks);
  const bg = useColorModeValue("white", "charcoalBlack");
  const navBtnBg = useColorModeValue("brand.600", "brand.300");
  const navBtnBgHover = useColorModeValue("gray.200", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const hoverTextColor = useColorModeValue("gray.800", "gray.100");
  const siteSettings = useSiteConfig();
  const navBtnActiveColor = useColorModeValue("#fff", "black");
  const siteNameColor = useColorModeValue("gray.800", "gray.100");
  return (
    <Stack
      bg={bg}
      borderRight="1px"
      zIndex={1000}
      borderRightColor={borderColor}
      w={
        isMinimized
          ? "var(--dash-sidebar-mini-w)"
          : { base: "full", md: "var(--dash-sidebar-w)" }
      }
      h={"var(--chakra-vh)"}
      pos="fixed"
      {...rest}
    >
      <Flex flexDir={"column"} h={"full"} pb={5}>
        <Box>
          <Flex
            alignItems="center"
            mx={"auto"}
            mb={2}
            gap={3}
            py={3}
            px={isMinimized ? 0 : 4}
            justify={"center"}
          >
            {!isMinimized && (
              <Box flex={1}>
                <AppLogo
                  src={siteSettings?.siteLogoMobile?.value ?? ""}
                  size={"30px"}
                />
                <ChakraLink asChild color={navBtnBg} fontSize={"small"}>
                  <Link href="/">visit site</Link>
                </ChakraLink>
              </Box>
            )}
            <VStack>
              {isMinimized && (
                <AppLogo src={siteSettings?.siteLogo?.value} size={"30px"} />
              )}
              <IconButton
                aria-label="Toggle Sidebar"
                onClick={toggleMinimized}
                fontSize="20"
                size="sm"
                variant={"ghost"}
                alignSelf={"start"}
                colorPalette="gray"
                color={siteNameColor}
                // display={{ base: "none", md: "flex" }}
              >
                {isMinimized ? <LuChevronsRight /> : <LuChevronsLeft />}
              </IconButton>
            </VStack>
          </Flex>
        </Box>

        <Stack
          gap={2}
          flexGrow={1}
          px={isMinimized ? 3 : 4}
          justifyContent={"space-between"}
        >
          {processedNavLinks.map((item, index) => (
            <Box key={index}>
              {item.children ? (
                <NavItemWithChildren
                  navItems={navLinks}
                  item={item}
                  isMinimized={isMinimized}
                  navBtnBg={navBtnBg}
                  navBtnBgHover={navBtnBgHover}
                  textColor={textColor}
                  hoverTextColor={hoverTextColor}
                  navBtnActiveColor={navBtnActiveColor}
                  bg={bg}
                />
              ) : (
                <SidebarNavItem
                  icon={item.icon}
                  href={item.href}
                  isMinimized={isMinimized}
                  onOpenChange={onClose}
                  navBtnBg={navBtnBg}
                  navBtnActiveColor={navBtnActiveColor}
                  navBtnBgHover={navBtnBgHover}
                  textColor={textColor}
                  hoverTextColor={hoverTextColor}
                  bg={bg}
                >
                  {item.label}
                </SidebarNavItem>
              )}
            </Box>
          ))}
          <Stack
            flex={1}
            justify={"flex-end"}
            mt={"auto"}
            pl={isMinimized ? 0 : 3}
            // pb={5}
          >
            <LightDarkModeSwitch showLabel={!isMinimized} />
          </Stack>
        </Stack>
      </Flex>
    </Stack>
  );
};

DashboardSidebar.displayName = "DashboardSidebar";
