"use client";

import { HStack, Text, useBreakpointValue } from "@chakra-ui/react";

import { AppLogo } from "./AppLogo";
import { useSiteConfig } from "@/context/SiteConfig";
import { cn } from "@/lib/utils";
import { useColorModeValue } from "@/components/ui/color-mode";

interface Props {
  logoSize?: string;
  nameSize?: string;
  isFooter?: boolean;
  className?: string;
  logoBg?: string;
}
export const AppLogoAndName = ({
  logoSize = "40px",
  nameSize = "md",
  isFooter = false,
  className,
}: Props) => {
  const siteSettings = useSiteConfig();
  const logo = useBreakpointValue({
    base: siteSettings?.siteLogoMobile?.value || siteSettings?.siteLogo?.value,
    md: siteSettings?.siteLogo?.value,
  });
  const defaultLogoSize = useBreakpointValue({
    base: "40px",
    md: "40px",
  });
  return (
    <HStack className={cn(className, "!gap-0 pr-2 pl-1 rounded-sm self-start")}>
      <AppLogo size={logoSize || defaultLogoSize!} src={logo!} />
      {!isFooter && siteSettings.showSiteNameWithLogo.enabled && (
        <Text
          fontSize={nameSize}
          fontWeight="medium"
          fontFamily={"var(--font-heading)"}
          truncate
        >
          {siteSettings?.siteName?.value}
        </Text>
      )}
    </HStack>
  );
};
