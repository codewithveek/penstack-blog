import { Flex, Icon, Link } from "@chakra-ui/react";
import { PermissionGuard } from "../../PermissionGuard";
import { TPermissions } from "@/types";
import { ElementType, ReactNode } from "react";
import { usePathname } from "next/navigation";

export const SidebarNavItem = ({
  icon,
  children,
  href,
  nested = false,

  label,
  isMinimized,
  onClose,
  navBtnBg,
  navBtnBgHover,
  textColor,
  hoverTextColor,
  navBtnActiveColor,
  bg,
}: {
  icon?: ElementType;
  children: ReactNode;
  href: string;
  nested?: boolean;
  label?: string;
  isMinimized?: boolean;
  onClose?: () => void;
  navBtnBg: string;
  navBtnBgHover: string;
  textColor: string;
  hoverTextColor: string;
  navBtnActiveColor: string;
  bg: string;
}) => {
  const pathname = usePathname();
  const isActive =
    pathname === href ||
    (href.includes("/dashboard/posts/new") && pathname.match(href + "/*"));

  const content = (
    <Link
      display={"flex"}
      variant="unstyled"
      fontWeight={isActive ? "500" : "400"}
      pos={"relative"}
      gap={4}
      // pl={isMinimized ? 2 : 0}
      href={href}
      style={{ textDecoration: "none" }}
      onClick={onClose}
    >
      <Flex
        rounded={"md"}
        align={"center"}
        justify={isMinimized ? "center" : "flex-start"}
        gap={4}
        color={isActive ? navBtnActiveColor : textColor}
        py={nested ? "6px" : "8px"}
        px={isMinimized ? 2 : nested ? 3 : 4}
        fontSize={nested ? "small" : "15px"}
        flex={1}
        letterSpacing={0.5}
        bg={isActive ? navBtnBg : "transparent"}
        _hover={{
          bg: navBtnBgHover,
          color: hoverTextColor,
        }}
      >
        {icon && <Icon fontSize="17" as={icon} color={"inherit"} />}
        {label && label}
        {!isMinimized && children}
      </Flex>
    </Link>
  );

  return content;
};
