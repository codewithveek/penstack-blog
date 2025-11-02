import React, { useState, memo, useEffect, useRef } from "react";
import {
  LuTwitter,
  LuFacebook,
  LuLinkedin,
  LuMail,
  LuLink2,
  LuShare2,
  LuGithub,
  LuInstagram,
  LuCopy,
} from "react-icons/lu";

// Types for props
interface SocialShareButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label?: string;
  url?: string;
  title?: string;
  showLabel?: boolean;
  iconSize?: number;
  iconClassName?: string;
  labelClassName?: string;
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  rounded?: string;
  padding?: string;
  gap?: string;
  transition?: string;
  shareUrl?: (encodedUrl: string, encodedTitle: string) => string;
}

interface TwitterShareButtonProps
  extends Omit<SocialShareButtonProps, "icon" | "label" | "shareUrl"> {
  via?: string;
  hashtags?: string[];
}

interface FacebookShareButtonProps
  extends Omit<SocialShareButtonProps, "icon" | "label" | "shareUrl"> {}

interface LinkedInShareButtonProps
  extends Omit<SocialShareButtonProps, "icon" | "label" | "shareUrl"> {
  summary?: string;
  source?: string;
}

interface EmailShareButtonProps
  extends Omit<SocialShareButtonProps, "icon" | "label" | "shareUrl"> {
  subject?: string;
  body?: string;
}

interface CopyLinkButtonProps
  extends Omit<SocialShareButtonProps, "icon" | "label" | "shareUrl"> {
  successDuration?: number;
  successLabel?: string;
}

interface SocialShareGroupProps {
  url: string;
  title: string;
  platforms?: Array<"twitter" | "facebook" | "linkedin" | "email" | "copy">;
  orientation?: "horizontal" | "vertical";
  className?: string;
  showLabels?: boolean;
  iconSize?: number;
  spacing?: string;
  [key: string]: any; // For additional props to pass down
}

interface ShareButtonProps {
  url: string;
  title: string;
  showMenu?: boolean;
  onToggleMenu?: (isOpen: boolean) => void;
  buttonProps?: Partial<SocialShareButtonProps>;
  menuProps?: Partial<SocialShareGroupProps>;
}

// Base button component for social sharing
const SocialShareButton = memo<SocialShareButtonProps>(
  ({
    icon: Icon,
    label,
    url = "",
    title = "",
    onClick,
    showLabel = true,
    iconSize = 20,
    className = "font-semibold",
    iconClassName = "",
    labelClassName = "",
    bgColor = "bg-gray-100",
    textColor = "text-gray-800",
    hoverBgColor = "hover:bg-gray-200",
    hoverTextColor = "hover:text-gray-900",
    rounded = "rounded-md",
    padding = "p-2",
    gap = "gap-2",
    transition = "transition-colors duration-200",
    shareUrl,
    ...props
  }) => {
    // Default handler if no custom onClick is provided
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick) {
        onClick(e);
        return;
      }

      // Prevent default if it's a button
      e.preventDefault();

      // Encode URL and title for sharing
      const encodedUrl = url ? encodeURIComponent(url) : "";
      const encodedTitle = title ? encodeURIComponent(title) : "";

      // Open the share URL if available
      if (shareUrl && url) {
        window.open(
          shareUrl(encodedUrl, encodedTitle),
          "_blank",
          "noopener,noreferrer"
        );
      }
    };

    // Filter out any non-HTML standard props before passing to the button element
    const buttonProps = { ...props };

    // Remove any boolean attributes that might cause the warning
    // or convert them to string values if they're intended to be passed to the DOM
    Object.keys(buttonProps).forEach((key) => {
      if (typeof buttonProps[key as keyof typeof buttonProps] === "boolean") {
        // Convert boolean values to strings for non-boolean HTML attributes
        if (
          ![
            "disabled",
            "checked",
            "readOnly",
            "required",
            "hidden",
            "multiple",
            "selected",
            "open",
            "autoFocus",
            "autoPlay",
            "controls",
            "loop",
            "muted",
            "playsInline",
            "default",
            "capture",
            "formNoValidate",
            "noValidate",
            "allowFullScreen",
            "async",
            "defer",
            "reversed",
            "scoped",
            "seamless",
            "itemScope",
          ].includes(key)
        ) {
          buttonProps[key as keyof typeof buttonProps] =
            buttonProps[key as keyof typeof buttonProps].toString();
        }
      }
    });

    return (
      <button
        onClick={handleClick}
        className={`flex items-center ${showLabel ? gap : ""} ${padding} ${bgColor} ${textColor} ${hoverBgColor} ${hoverTextColor} ${rounded} ${transition} ${className}`}
        aria-label={`Share on ${label}`}
        {...buttonProps}
      >
        {Icon && <Icon size={iconSize} className={iconClassName} />}
        {showLabel && label && (
          <span className={`${labelClassName}`}>{label}</span>
        )}
      </button>
    );
  }
);

SocialShareButton.displayName = "SocialShareButton";

// Specific social media sharing components
const TwitterShareButton = memo<TwitterShareButtonProps>(
  ({ url, title, via = "", hashtags = [], ...props }) => {
    const shareUrl = (encodedUrl: string, encodedTitle: string): string => {
      let twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

      if (via) {
        twitterUrl += `&via=${encodeURIComponent(via)}`;
      }

      if (hashtags.length > 0) {
        twitterUrl += `&hashtags=${encodeURIComponent(hashtags.join(","))}`;
      }

      return twitterUrl;
    };

    return (
      <SocialShareButton
        icon={LuTwitter}
        label="Twitter"
        url={url}
        title={title}
        shareUrl={shareUrl}
        bgColor="bg-blue-50"
        textColor="text-blue-500"
        hoverBgColor="hover:bg-blue-100"
        hoverTextColor="hover:text-blue-600"
        {...props}
      />
    );
  }
);

TwitterShareButton.displayName = "TwitterShareButton";

const FacebookShareButton = memo<FacebookShareButtonProps>(
  ({ url, title, ...props }) => {
    const shareUrl = (encodedUrl: string): string =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    return (
      <SocialShareButton
        icon={LuFacebook}
        label="Facebook"
        url={url}
        title={title}
        shareUrl={shareUrl}
        bgColor="bg-indigo-50"
        textColor="text-indigo-500"
        hoverBgColor="hover:bg-indigo-100"
        hoverTextColor="hover:text-indigo-600"
        {...props}
      />
    );
  }
);

FacebookShareButton.displayName = "FacebookShareButton";

const LinkedInShareButton = memo<LinkedInShareButtonProps>(
  ({ url, title, summary = "", source = "", ...props }) => {
    const shareUrl = (encodedUrl: string, encodedTitle: string): string => {
      let linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

      if (title) {
        linkedinUrl += `&title=${encodedTitle}`;
      }

      if (summary) {
        linkedinUrl += `&summary=${encodeURIComponent(summary)}`;
      }

      if (source) {
        linkedinUrl += `&source=${encodeURIComponent(source)}`;
      }

      return linkedinUrl;
    };

    return (
      <SocialShareButton
        icon={LuLinkedin}
        label="LinkedIn"
        url={url}
        title={title}
        shareUrl={shareUrl}
        bgColor="bg-blue-50"
        textColor="text-blue-700"
        hoverBgColor="hover:bg-blue-100"
        hoverTextColor="hover:text-blue-800"
        {...props}
      />
    );
  }
);

LinkedInShareButton.displayName = "LinkedInShareButton";

const EmailShareButton = memo<EmailShareButtonProps>(
  ({ url, title, subject = "", body = "", ...props }) => {
    const shareUrl = (encodedUrl: string, encodedTitle: string): string => {
      const emailSubject = subject || encodedTitle;
      const emailBody = body || `${encodedTitle}\n\n${url}`;

      return `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    };

    return (
      <SocialShareButton
        icon={LuMail}
        label="Email"
        url={url}
        title={title}
        shareUrl={shareUrl}
        bgColor="bg-gray-50"
        textColor="text-gray-600"
        hoverBgColor="hover:bg-gray-100"
        hoverTextColor="hover:text-gray-800"
        {...props}
      />
    );
  }
);

EmailShareButton.displayName = "EmailShareButton";

const CopyLinkButton = memo<CopyLinkButtonProps>(
  ({
    url,
    title,
    successDuration = 2000,
    successLabel = "Copied!",
    ...props
  }) => {
    const [copied, setCopied] = useState<boolean>(false);
    if (!url) return null;
    const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);

        // Reset after successDuration
        const timer = setTimeout(() => {
          setCopied(false);
        }, successDuration);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error("Failed to copy URL:", err);
      }
    };

    return (
      <SocialShareButton
        icon={LuCopy}
        label={copied ? successLabel : "Copy Link"}
        url={url}
        title={title}
        onClick={handleCopy}
        bgColor={copied ? "bg-green-50" : "bg-gray-50"}
        textColor={copied ? "text-green-600" : "text-gray-600"}
        hoverBgColor={copied ? "hover:bg-green-100" : "hover:bg-gray-100"}
        hoverTextColor={copied ? "hover:text-green-700" : "hover:text-gray-800"}
        {...props}
      />
    );
  }
);

CopyLinkButton.displayName = "CopyLinkButton";

// Social Share Group component that combines multiple share buttons
const SocialShareGroup = memo<SocialShareGroupProps>(
  ({
    url,
    title,
    platforms = ["twitter", "facebook", "linkedin", "email"],
    orientation = "horizontal",
    className = "",
    showLabels = true,
    iconSize = 20,
    spacing = "gap-2",
    ...props
  }) => {
    // Filter out non-standard HTML attributes that might be passed as boolean
    const sanitizedProps = { ...props };

    // Remove any properties that shouldn't be passed directly to child components
    // or convert boolean values to strings for non-boolean HTML attributes
    Object.keys(sanitizedProps).forEach((key) => {
      if (
        typeof sanitizedProps[key] === "boolean" &&
        !["showLabels", "iconSize"].includes(key)
      ) {
        sanitizedProps[key] = sanitizedProps[key].toString();
      }
    });

    const renderPlatformButton = (platform: string) => {
      const commonProps = {
        url,
        title,
        showLabel: showLabels,
        iconSize,
        ...sanitizedProps,
      };

      switch (platform.toLowerCase()) {
        case "twitter":
          return <TwitterShareButton key="twitter" {...commonProps} />;
        case "facebook":
          return <FacebookShareButton key="facebook" {...commonProps} />;
        case "linkedin":
          return <LinkedInShareButton key="linkedin" {...commonProps} />;
        case "email":
          return <EmailShareButton key="email" {...commonProps} />;
        case "copy":
          return <CopyLinkButton key="copy" {...commonProps} />;
        default:
          return null;
      }
    };

    const orientationClass =
      orientation === "vertical" ? "flex-col" : "flex-row";

    return (
      <div className={`flex ${orientationClass} ${spacing} ${className}`}>
        {platforms.map(renderPlatformButton)}
      </div>
    );
  }
);

SocialShareGroup.displayName = "SocialShareGroup";

// Share button that can toggle a menu of share options
const ShareButton = memo<ShareButtonProps>(
  ({
    url,
    title,
    showMenu = false,
    onToggleMenu,
    buttonProps = {},
    menuProps = {},
  }) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(showMenu);

    // Handle menu state
    useEffect(() => {
      setIsMenuOpen(showMenu);
    }, [showMenu]);

    const toggleMenu = (): void => {
      const newState = !isMenuOpen;
      setIsMenuOpen(newState);
      if (onToggleMenu) {
        onToggleMenu(newState);
      }
    };

    // Close on outside click
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent): void => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node)
        ) {
          setIsMenuOpen(false);
          if (onToggleMenu) {
            onToggleMenu(false);
          }
        }
      };

      if (isMenuOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isMenuOpen, onToggleMenu]);

    // Sanitize button props to handle boolean attributes
    const sanitizedButtonProps = { ...buttonProps };
    Object.keys(sanitizedButtonProps).forEach((key) => {
      if (
        typeof sanitizedButtonProps[
          key as keyof typeof sanitizedButtonProps
        ] === "boolean"
      ) {
        // Convert boolean values to strings for non-boolean HTML attributes
        if (
          ![
            "disabled",
            "checked",
            "readOnly",
            "required",
            "hidden",
            "multiple",
            "selected",
            "open",
            "autoFocus",
            "autoPlay",
            "controls",
            "loop",
            "muted",
            "playsInline",
            "default",
            "capture",
            "formNoValidate",
            "noValidate",
            "allowFullScreen",
            "async",
            "defer",
            "reversed",
            "scoped",
            "seamless",
            "itemScope",
          ].includes(key)
        ) {
          sanitizedButtonProps[key as keyof typeof sanitizedButtonProps] =
            sanitizedButtonProps[
              key as keyof typeof sanitizedButtonProps
            ].toString();
        }
      }
    });

    return (
      <div className="relative" ref={menuRef}>
        <SocialShareButton
          icon={LuShare2}
          label="Share"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen ? "true" : "false"} // Convert boolean to string
          aria-haspopup="true"
          {...sanitizedButtonProps}
        />

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg p-2 z-10 min-w-48">
            <SocialShareGroup
              url={url}
              title={title}
              orientation="vertical"
              className="w-full"
              {...menuProps}
            />
          </div>
        )}
      </div>
    );
  }
);

ShareButton.displayName = "ShareButton";
export {
  SocialShareButton,
  TwitterShareButton,
  FacebookShareButton,
  LinkedInShareButton,
  EmailShareButton,
  CopyLinkButton,
  SocialShareGroup,
  ShareButton,
};
