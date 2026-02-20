import React, { useState } from "react";
import { Box, Container, HStack, Button, IconButton, Menu, Text, Drawer, VStack, Separator, Icon, Hide, useBreakpointValue, Show, Input, InputGroup } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { LuMenu, LuChevronDown, LuSearch } from "react-icons/lu";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LightDarkModeSwitch } from "../LightDarkModeSwitch";
import { AuthButtons } from "./AuthButtons";
import { useCategories } from "@/hooks/useCategories";
import { AppLogo } from "../AppLogoAndName/AppLogo";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSiteConfig } from "@/context/SiteConfig";

const Header = () => {
  const [open, setOpen] = useState(false);
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBgColor = useColorModeValue("gray.100", "gray.700");
  const navLinkHoverColor = useColorModeValue("brand.500", "brand.300");
  const siteSettings = useSiteConfig();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const backgroundColor = useTransform(
    scrollY,
    [0, 60],
    [
      useColorModeValue("rgba(255, 255, 255, 1)", "rgba(26, 32, 44, 0.4)"),
      useColorModeValue("rgba(255, 255, 255, 1)", "rgba(26, 32, 44, 1)"),
    ]
  );
  const borderOpacity = useTransform(scrollY, [0, 60], [0, 1]);
  const boxShadow = useTransform(
    scrollY,
    [0, 60],
    ["none", "var(--chakra-shadows-md)"]
  );
  const backdrop = useTransform(scrollY, [0, 60], ["none", "blur(10px"]) as any;
  const canFetchCategories = useBreakpointValue({ base: open, md: true });
  const { data } = useCategories({
    limit: 5,
    canFetch: canFetchCategories,
    hasPostsOnly: true,
  });
  const categories = data?.results;

  const resources = [
    { name: "Articles", href: "/articles" },
    // { name: "Tutorials", href: "/resources/tutorials" },
    { name: "Newsletter", href: "/newsletter" },
  ];
  function isActiveUrl(url: string) {
    return pathname === url;
  }
  const logo = useBreakpointValue({
    base: siteSettings?.siteMobileLogo?.value || siteSettings?.siteLogo?.value,
    md: siteSettings?.siteLogo?.value,
  });
  const logoSize = useBreakpointValue({
    base: "50px",
    md: "40px",
  });
  const SearchComp = () => (
    <HStack
      as="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (searchInput) {
          router.push(`/search?q=${searchInput}`);
        }
      }}
    >
      <InputGroup>
        <Input
          rounded={"full"}
          onChange={(e) => {
            setSearchInput(e.target.value);
          }}
          w="full"
          placeholder="Search Articles..."
        />
        <InputElement>
          <IconButton
            size="sm"
            rounded={"full"}
            // variant={"ghost"}
            disabled={!searchInput}
            onClick={() => {
              if (searchInput) {
                router.push(`/search?q=${searchInput}`);
              }
            }}
            aria-label="Search"
          >
            <LuSearch />
          </IconButton>
        </InputElement>
      </InputGroup>
    </HStack>
  );
  SearchComp.displayName = "SearchComp";

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor,
      }}
    >
      <Box
        as={motion.header}
        style={{
          borderBottom: useTransform(borderOpacity, (opacity) =>
            opacity === 0 ? "none" : `1px solid ${borderColor}`
          ),
          backdropFilter: backdrop,
          boxShadow,
        }}
        transition="all 0.3s ease-in-out"
      >
        <Container maxW="container.2xl" py={"6px"}>
          <HStack justify="space-between" align="center">
            <Link href="/" style={{ textDecoration: "none" }}>
              <HStack gap={0}>
              <AppLogo src={logo!} size={logoSize!} />
              {siteSettings.showSiteNameWithLogo?.enabled && (
                <Text
                  hideBelow={"md"}
                  as={"span"}
                  fontSize={{ base: "medium", lg: "large" }}
                  fontWeight="bold"
                  fontFamily={"var(--font-heading)"}
                >
                  {siteSettings?.siteName?.value}
                </Text>
              )}
              </HStack>
            </Link>

            <HStack
              align="center"
              gap={4}
              display={{ base: "none", xl: "flex" }}
              py={"6px"}
            >
              {/* <Link
                textTransform="capitalize"
                fontWeight={500}
                href={"/"}
                color={isActiveUrl("/") ? navLinkHoverColor : "inherit"}
                borderBottom={"2px solid"}
                borderBottomColor={
                  isActiveUrl("/") ? navLinkHoverColor : "transparent"
                }
                px={2}
                py={1}
                _hover={{
                  borderColor: navLinkHoverColor,
                  color: navLinkHoverColor,
                }}
              >
                Home
              </Link> */}

              {resources.map((resource) => (
                <Link
                  key={resource.name}
                  fontFamily={"var(--font-heading)"}
                  textTransform="capitalize"
                  fontWeight={500}
                  href={resource.href}
                  px={2}
                  py={1}
                  color={
                    isActiveUrl(resource.href) ? navLinkHoverColor : "inherit"
                  }
                  borderBottom={"2px solid"}
                  borderBottomColor={
                    isActiveUrl(resource.href)
                      ? navLinkHoverColor
                      : "transparent"
                  }
                  _hover={{
                    borderColor: navLinkHoverColor,
                    color: navLinkHoverColor,
                  }}
                >
                  {resource.name}
                </Link>
              ))}
              <Menu.Root>
                {({ open }) => (
                  <>
                    <Menu.Trigger asChild>
                      <Button
                        rounded={"none"}
                        textTransform="capitalize"
                        fontWeight={500}
                        size="sm"
                        colorPalette="black"
                        variant="ghost"
                        _hover={{
                          borderColor: navLinkHoverColor,
                          color: navLinkHoverColor,
                        }}
                        borderBottom={"2px solid"}
                        borderBottomColor={"transparent"}
                      >
                        <HStack>
                          <Text as={"span"} fontWeight={600}>
                            Topics
                          </Text>
                          <LuChevronDown />
                        </HStack>
                      </Button>
                    </Menu.Trigger>
                    <Menu.Content rounded="lg">
                      {categories &&
                        categories?.length > 0 &&
                        categories.map((topic) => (
                          <Menu.Item
                            key={topic.name}
                            asChild
                          >
                            <Link href={`/category/${topic.slug}`}>
                              {topic.name}
                            </Link>
                          </Menu.Item>
                        ))}
                    </Menu.Content>
                  </>
                )}
              </Menu.Root>
            </HStack>

            <HStack gap={4} align={"center"}>
              <Box display={{ base: "none", lg: "flex" }}>
                <SearchComp />
              </Box>

              <HStack gap={2} display={{ base: "none", xl: "flex" }}>
                {/* <Show above="lg">
                  <LightDarkModeSwitch />
                </Show> */}
                <AuthButtons />
              </HStack>
              <Show below="lg">
                <AuthButtons />
              </Show>

              <IconButton
                // colorPalette="black"
                display={{ base: "flex", xl: "none" }}
                aria-label="Open menu"
                onClick={onOpen}
                variant="ghost"
                _hover={{ bg: hoverBgColor }}
              >
                <LuMenu size={20} />
              </IconButton>
            </HStack>
          </HStack>
        </Container>

        <Drawer.Root open={open} placement="right" onOpenChange={onOpenChange}>
          <Drawer.Backdrop />
          <Drawer.Content>
            <Drawer.CloseTrigger />
            <Drawer.Header borderBottomWidth="1px">Menu</Drawer.Header>
            <Drawer.Body>
              <VStack align="stretch" gap={4} Separator={<Separator />}>
                <Box>
                  <Text fontWeight="bold" color={textColor}>
                    Categories
                  </Text>
                  {categories &&
                    categories?.length > 0 &&
                    categories.map((topic) => (
                      <Button
                        key={topic.name}
                        rounded={"full"}
                        asChild
                        variant="ghost"
                        justifyContent="flex-start"
                        w="full"
                        onClick={onOpenChange}
                      >
                        <Link href={`/category/${topic.slug}`}>
                          {topic.name}
                        </Link>
                      </Button>
                    ))}
                </Box>
                <Box>
                  <Text fontWeight="bold" color={textColor}>
                    Resources
                  </Text>
                  {resources.map((resource) => (
                    <Button
                      key={resource.name}
                      rounded={"full"}
                      asChild
                      variant="ghost"
                      justifyContent="flex-start"
                      w="full"
                      onClick={onOpenChange}
                    >
                      <Link href={resource.href}>
                        {resource.name}
                      </Link>
                    </Button>
                  ))}
                </Box>

                <SearchComp />

                <AuthButtons />

                {/* <LightDarkModeSwitch showLabel /> */}
              </VStack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Root>
      </Box>
    </motion.div>
  );
};

export default Header;
