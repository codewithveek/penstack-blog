import { Popover, Box, VStack, Separator, Flex, HStack, Button, Icon, Text } from "@chakra-ui/react";
import { NavItemWithoutPermission } from "@/types";

import { LuChevronDown } from "react-icons/lu";
import { SidebarNavItem } from "./NavItem";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useColorModeValue } from "@/components/ui/color-mode";

export const NavItemWithChildren = ({
  item,
  navBtnBg,
  navBtnBgHover,
  textColor,
  hoverTextColor,
  isMinimized,
  navBtnActiveColor,
  navItems,
  bg,
}: {
  item: NavItemWithoutPermission;
  navItems: NavItemWithoutPermission[];
  isMinimized?: boolean;
  navBtnBg: string;
  navBtnBgHover: string;
  textColor: string;
  hoverTextColor: string;
  navBtnActiveColor: string;
  bg: string;
}) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const childrenBg = useColorModeValue("gray.100", "gray.900");

  const toggleOpen = (href: string) => {
    setOpenItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    );
  };
  useEffect(() => {
    const activeParent = navItems.find(
      (item) =>
        item.children &&
        item.children.some((child) => pathname.startsWith(child.href))
    );
    if (activeParent) {
      setOpenItems((prev) =>
        prev.includes(activeParent.href) ? prev : [...prev, activeParent.href]
      );
    }
  }, [navItems, pathname]);
  if (isMinimized) {
    return (
      <Popover.Root
        placement="right"
        open={isOpen}
        onOpen={onOpen}
        onOpenChange={onClose}
        trigger="hover"
      >
        <Popover.Trigger>
          <Box>
            <SidebarNavItem
              navBtnActiveColor={navBtnActiveColor}
              icon={item.icon}
              href={item.href}
              onOpenChange={onClose}
              isMinimized={isMinimized}
              navBtnBg={navBtnBg}
              navBtnBgHover={navBtnBgHover}
              textColor={textColor}
              hoverTextColor={hoverTextColor}
              bg={bg}
            >
              {item.label}
            </SidebarNavItem>
          </Box>
        </Popover.Trigger>
        <Popover.Content ml={2} w="200px" rounded={"md"}>
          <Popover.Arrow bg={bg} />
          <Popover.Body p={2} bg={bg} rounded={"md"}>
            <VStack
              align="stretch"
              gap={2}
              separator={<Separator />}
              role="group"
            >
              {item.children?.map((child, idx) => (
                <SidebarNavItem
                  navBtnActiveColor={navBtnActiveColor}
                  key={idx}
                  href={child.href}
                  nested
                  label={child?.label}
                  onOpenChange={onClose}
                  isMinimized={isMinimized}
                  navBtnBg={navBtnBg}
                  navBtnBgHover={navBtnBgHover}
                  textColor={textColor}
                  hoverTextColor={hoverTextColor}
                  bg={bg}
                >
                  {child.label}
                </SidebarNavItem>
              ))}
            </VStack>
          </Popover.Body>
        </Popover.Content>
      </Popover.Root>
    );
  }
  const isActive =
    pathname === item.href ||
    (item.href.includes("/dashboard/posts/new") &&
      pathname.match(item.href + "/*"));

  return (
    <>
      <Button
        fontWeight={isActive ? "500" : "400"}
        variant={"unstyled"}
        w="full"
        p={0}
        roundedBottom={openItems.includes(item.href) ? "0" : "md"}
        size={"sm"}
        cursor="pointer"
        onClick={() => toggleOpen(item.href)}
        justifyContent={isMinimized ? "center" : "space-between"}
      >
        <Flex
          rounded={{ base: "sm", md: "md" }}
          align={"center"}
          justify={isMinimized ? "center" : "space-between"}
          gap={4}
          py={"6px"}
          px={isMinimized ? 2 : 4}
          fontSize={"small"}
          w="full"
          bg={
            item.children?.some((child) => pathname.startsWith(child.href)) ||
              openItems.includes(item.href)
              ? navBtnBg
              : "transparent"
          }
          color={
            item.children?.some((child) => pathname.startsWith(child.href)) ||
              openItems.includes(item.href)
              ? navBtnActiveColor
              : textColor
          }
          _hover={{
            bg: openItems.includes(item.href) ? navBtnBgHover : "gray.100",
            color: hoverTextColor,
          }}
        >
          <HStack gap={0}>
            <Icon mr="4" fontSize="17" as={item.icon} />
            <Text flex="1">{item.label}</Text>
          </HStack>
          <Icon
            as={LuChevronDown}
            transition="all .25s ease-in-out"
            transform={openItems.includes(item.href) ? "rotate(180deg)" : ""}
          />
        </Flex>
      </Button>
      {openItems.includes(item.href) && (
        <VStack
          gap={3}
          align="stretch"
          px={3}
          py={4}
          mt={-1}
          bg={childrenBg}
          roundedBottom="md"
        >
          {item.children?.map((child, childIndex) => (
            <SidebarNavItem
              key={childIndex}
              href={child.href}
              nested
              isMinimized={isMinimized}
              navBtnBg={navBtnBg}
              navBtnBgHover={navBtnBgHover}
              textColor={textColor}
              navBtnActiveColor={navBtnActiveColor}
              hoverTextColor={hoverTextColor}
              bg={bg}
            >
              {child.label}
            </SidebarNavItem>
          ))}
        </VStack>
      )}
    </>
  );
};
