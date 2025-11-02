import React, { useState, memo, useEffect, useRef, useMemo } from "react";
import {
  SocialShareThemeName,
  SocialShareVariantName,
  SocialShareSizeName,
  SocialSharePlatformName,
  SOCIAL_SHARE_VARIANTS,
  SOCIAL_SHARE_THEMES,
  SOCIAL_SHARE_SIZES,
} from "./config";
import {
  CopyIcon,
  FacebookIcon,
  LinkedInIcon,
  MailIcon,
  ShareIcon,
  TwitterIcon,
  XIcon,
} from "./icons";

// Icon Components (using SVG paths)

// Theme definitions

interface ThemedSocialShareButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label?: string;
  url?: string;
  title?: string;
  showLabel?: boolean;
  theme?: SocialShareThemeName;
  variant?: SocialShareVariantName;
  size?: SocialShareSizeName;
  platform?: SocialSharePlatformName;
  shareUrl?: (encodedUrl: string, encodedTitle: string) => string;
}

interface ThemedSocialShareGroupProps {
  url: string;
  title: string;
  platforms?: SocialSharePlatformName[];
  orientation?: "horizontal" | "vertical";
  className?: string;
  showLabels?: boolean;
  theme?: SocialShareThemeName;
  variant?: SocialShareVariantName;
  size?: SocialShareSizeName;
  spacing?: string;
  /**
   * @description LinkedIn summary (for linkedin only)
   */
  summary?: string;
  /**
   * @description LinkedIn source (for linkedin only)
   */
  source?: string;
  /**
   * @description X/Twitter via (for x/twitter only)
   */
  via?: string;
  /**
   * @description X/Twitter hashtags (for x/twitter only)
   */
  hashtags?: string[];
}

interface ThemedShareButtonProps {
  url: string;
  title: string;
  showMenu?: boolean;
  onToggleMenu?: (isOpen: boolean) => void;
  theme?: SocialShareThemeName;
  variant?: SocialShareVariantName;
  size?: SocialShareSizeName;
  buttonProps?: Partial<ThemedSocialShareButtonProps>;
  menuProps?: Partial<ThemedSocialShareGroupProps>;
}

// Hook for theme styling
const useThemeStyles = (
  theme: SocialShareThemeName = "default",
  variant: SocialShareVariantName = "default",
  size: SocialShareSizeName = "md",
  platform?: SocialSharePlatformName
) => {
  return useMemo(() => {
    const themeConfig = SOCIAL_SHARE_THEMES[theme];
    const variantConfig = SOCIAL_SHARE_VARIANTS[variant];
    const sizeConfig = SOCIAL_SHARE_SIZES[size];

    // Get platform-specific styles or fall back to base
    const platformStyles = {
      ...themeConfig.base,
      ...(platform ? themeConfig.platforms?.[platform] : {}),
    };

    return {
      bgColor: platformStyles.bgColor || themeConfig.base.bgColor,
      textColor: platformStyles.textColor || themeConfig.base.textColor,
      hoverBgColor:
        platformStyles.hoverBgColor || themeConfig.base.hoverBgColor,
      hoverTextColor:
        platformStyles.hoverTextColor || themeConfig.base.hoverTextColor,
      border: platformStyles.border || themeConfig.base.border || "",
      rounded: variantConfig.rounded,
      padding: sizeConfig.padding,
      gap: variantConfig.gap,
      iconSize: sizeConfig.iconSize,
      textSize: sizeConfig.text,
    };
  }, [theme, variant, size, platform]);
};

// Base themed button component
const ThemedSocialShareButton = memo<ThemedSocialShareButtonProps>(
  ({
    icon: Icon,
    label,
    url = "",
    title = "",
    onClick,
    showLabel = true,
    theme = "default",
    variant = "default",
    size = "md",
    platform,
    className = "",
    shareUrl,
    ...props
  }) => {
    const styles = useThemeStyles(theme, variant, size, platform);

    const encodedUrl = url ? encodeURIComponent(url) : "";
    const encodedTitle = title ? encodeURIComponent(title) : "";
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
        return;
      }

      e.preventDefault();

      if (shareUrl && url) {
        window.open(
          shareUrl(encodedUrl, encodedTitle),
          "_blank",
          "noopener,noreferrer"
        );
      }
    };

    const buttonClasses = useMemo(() => {
      const baseClasses =
        "flex items-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
      const conditionalGap = showLabel && label ? styles.gap : "";

      return `${baseClasses} ${conditionalGap} ${styles.padding} ${styles.bgColor} ${styles.textColor} ${styles.hoverBgColor} ${styles.hoverTextColor} ${styles.rounded} ${styles.border} ${styles.textSize} ${className}`.trim();
    }, [showLabel, label, styles, className]);

    return (
      <>
        {platform === "copy" ? (
          <button
            onClick={handleClick}
            className={buttonClasses}
            aria-label={`Copy article link`}
            {...props}
          >
            {Icon && <Icon size={styles.iconSize} />}
            {showLabel && label && <span>{label}</span>}
          </button>
        ) : (
          <>
            <a
              href={shareUrl?.(encodedUrl, encodedTitle) || ""}
              className={buttonClasses}
              aria-label={`Share on ${label}`}
              {...(props as any)}
              target={"_blank"}
            >
              {Icon && <Icon size={styles.iconSize} />}
              {showLabel && label && <span>{label}</span>}
            </a>
          </>
        )}
      </>
    );
  }
);

ThemedSocialShareButton.displayName = "ThemedSocialShareButton";

// Platform-specific components
const ThemedTwitterShareButton = memo<
  Omit<ThemedSocialShareButtonProps, "icon" | "label" | "platform"> & {
    via?: string;
    hashtags?: string[];
  }
>(({ url, title, via = "", hashtags = [], ...props }) => {
  const shareUrl = useMemo(
    () =>
      (encodedUrl: string, encodedTitle: string): string => {
        let twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        if (via) twitterUrl += `&via=${encodeURIComponent(via)}`;
        if (hashtags.length > 0)
          twitterUrl += `&hashtags=${encodeURIComponent(hashtags.join(","))}`;
        return twitterUrl;
      },
    [via, hashtags]
  );

  return (
    <ThemedSocialShareButton
      icon={TwitterIcon}
      label="Twitter"
      url={url}
      title={title}
      platform="twitter"
      shareUrl={shareUrl}
      {...props}
    />
  );
});

ThemedTwitterShareButton.displayName = "ThemedTwitterShareButton";
const ThemedXShareButton = memo<
  Omit<ThemedSocialShareButtonProps, "icon" | "label" | "platform"> & {
    via?: string;
    hashtags?: string[];
  }
>(({ url, title, via = "", hashtags = [], ...props }) => {
  const shareUrl = useMemo(
    () =>
      (encodedUrl: string, encodedTitle: string): string => {
        let twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        if (via) twitterUrl += `&via=${encodeURIComponent(via)}`;
        if (hashtags.length > 0)
          twitterUrl += `&hashtags=${encodeURIComponent(hashtags.join(","))}`;
        return twitterUrl;
      },
    [via, hashtags]
  );

  return (
    <ThemedSocialShareButton
      icon={XIcon}
      label="X"
      url={url}
      title={title}
      platform="x"
      shareUrl={shareUrl}
      {...props}
    />
  );
});

ThemedXShareButton.displayName = "ThemedXShareButton";

const ThemedFacebookShareButton = memo<
  Omit<ThemedSocialShareButtonProps, "icon" | "label" | "platform">
>(({ url, title, ...props }) => {
  const shareUrl = useMemo(
    () =>
      (encodedUrl: string): string =>
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    []
  );

  return (
    <ThemedSocialShareButton
      icon={FacebookIcon}
      label="Facebook"
      url={url}
      title={title}
      platform="facebook"
      shareUrl={shareUrl}
      {...props}
    />
  );
});

ThemedFacebookShareButton.displayName = "ThemedFacebookShareButton";

const ThemedLinkedInShareButton = memo<
  Omit<ThemedSocialShareButtonProps, "icon" | "label" | "platform"> & {
    summary?: string;
    source?: string;
  }
>(({ url, title, summary = "", source = "", ...props }) => {
  const shareUrl = useMemo(
    () =>
      (encodedUrl: string, encodedTitle: string): string => {
        let linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        if (title) linkedinUrl += `&title=${encodedTitle}`;
        if (summary) linkedinUrl += `&summary=${encodeURIComponent(summary)}`;
        if (source) linkedinUrl += `&source=${encodeURIComponent(source)}`;
        return linkedinUrl;
      },
    [summary, source, title]
  );

  return (
    <ThemedSocialShareButton
      icon={LinkedInIcon}
      label="LinkedIn"
      url={url}
      title={title}
      platform="linkedin"
      shareUrl={shareUrl}
      {...props}
    />
  );
});

ThemedLinkedInShareButton.displayName = "ThemedLinkedInShareButton";

const ThemedEmailShareButton = memo<
  Omit<ThemedSocialShareButtonProps, "icon" | "label" | "platform"> & {
    subject?: string;
    body?: string;
  }
>(({ url, title, subject = "", body = "", ...props }) => {
  const shareUrl = useMemo(
    () =>
      (encodedUrl: string, encodedTitle: string): string => {
        const emailSubject = subject || encodedTitle;
        const emailBody = body || `${encodedTitle}\n\n${url}`;
        return `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      },
    [subject, body, url]
  );

  return (
    <ThemedSocialShareButton
      icon={MailIcon}
      label="Email"
      url={url}
      title={title}
      platform="email"
      shareUrl={shareUrl}
      {...props}
    />
  );
});

ThemedEmailShareButton.displayName = "ThemedEmailShareButton";

const ThemedCopyLinkButton = memo<
  Omit<ThemedSocialShareButtonProps, "icon" | "label" | "platform"> & {
    successDuration?: number;
    successLabel?: string;
  }
>(
  ({
    url,
    title,
    successDuration = 2000,
    successLabel = "Copied!",
    ...props
  }) => {
    const [copied, setCopied] = useState<boolean>(false);

    const handleCopy = useMemo(
      () => async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(url || "");
          setCopied(true);
          setTimeout(() => setCopied(false), successDuration);
        } catch (err) {
          console.error("Failed to copy URL:", err);
        }
      },
      [url, successDuration]
    );

    return (
      <ThemedSocialShareButton
        icon={CopyIcon}
        label={copied ? successLabel : "Copy Link"}
        url={url || ""}
        title={title}
        platform="copy"
        onClick={handleCopy}
        {...props}
      />
    );
  }
);

ThemedCopyLinkButton.displayName = "ThemedCopyLinkButton";

// Themed group component
export const ThemedSocialShareGroup = memo<ThemedSocialShareGroupProps>(
  ({
    url,
    title,
    platforms = ["copy", "x", "facebook", "linkedin", "email"],
    orientation = "horizontal",
    className = "",
    showLabels = true,
    theme = "default",
    variant = "default",
    size = "md",
    spacing = "gap-2",
    summary,
    source,
    via,
    hashtags,
  }) => {
    const renderPlatformButton = useMemo(
      // eslint-disable-next-line react/display-name
      () => (platform: SocialSharePlatformName) => {
        const commonProps = {
          url,
          title,
          showLabel: showLabels,
          theme,
          variant,
          size,
        };

        switch (platform) {
          case "twitter":
            return (
              <ThemedTwitterShareButton
                key="twitter"
                {...commonProps}
                via={via}
                hashtags={hashtags}
              />
            );
          case "facebook":
            return (
              <ThemedFacebookShareButton key="facebook" {...commonProps} />
            );
          case "linkedin":
            return (
              <ThemedLinkedInShareButton
                key="linkedin"
                {...commonProps}
                summary={summary}
                source={source}
              />
            );
          case "email":
            return <ThemedEmailShareButton key="email" {...commonProps} />;
          case "x":
            return (
              <ThemedXShareButton
                key="x"
                {...commonProps}
                via={via}
                hashtags={hashtags}
              />
            );
          case "copy":
            return <ThemedCopyLinkButton key="copy" {...commonProps} />;
          default:
            return null;
        }
      },
      [
        url,
        title,
        showLabels,
        theme,
        variant,
        size,
        summary,
        source,
        via,
        hashtags,
      ]
    );

    const orientationClass =
      orientation === "vertical" ? "flex-col" : "flex-row";
    const compactSpacing = variant === "compact" ? "gap-0" : spacing;

    return (
      <div
        className={`flex ${orientationClass} ${compactSpacing} ${className}`}
      >
        {platforms.map(renderPlatformButton)}
      </div>
    );
  }
);

ThemedSocialShareGroup.displayName = "ThemedSocialShareGroup";

// Themed share button with menu
const ThemedShareButton = memo<ThemedShareButtonProps>(
  ({
    url,
    title,
    showMenu = false,
    onToggleMenu,
    theme = "default",
    variant = "default",
    size = "md",
    buttonProps = {},
    menuProps = {},
  }) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(showMenu);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setIsMenuOpen(showMenu);
    }, [showMenu]);

    const toggleMenu = (): void => {
      const newState = !isMenuOpen;
      setIsMenuOpen(newState);
      onToggleMenu?.(newState);
    };

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent): void => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setIsMenuOpen(false);
          onToggleMenu?.(false);
        }
      };

      if (isMenuOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isMenuOpen, onToggleMenu]);

    return (
      <div className="relative" ref={menuRef}>
        <ThemedSocialShareButton
          icon={ShareIcon}
          label="Share"
          onClick={toggleMenu}
          theme={theme}
          variant={variant}
          size={size}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
          {...buttonProps}
        />

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border p-2 z-10 min-w-48">
            <ThemedSocialShareGroup
              url={url}
              title={title}
              orientation="vertical"
              className="w-full"
              theme={theme}
              variant={variant}
              size={size}
              {...menuProps}
            />
          </div>
        )}
      </div>
    );
  }
);

ThemedShareButton.displayName = "ThemedShareButton";
