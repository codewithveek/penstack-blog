import {
  DASH_NAV_PERMISSIONS,
  NavItemWithoutPermission,
  TPermissions,
} from "@/types";
import {
  LuHouse,
  LuFileSpreadsheet,
  LuFileImage,
  LuUsers,
  LuCombine,
  LuMessageSquare,
  LuMail,
  LuSettings,
  LuUnplug
} from "react-icons/lu";

const iconMap = {
  LuHouse,
  LuFileSpreadsheet,
  LuFileImage,
  LuUsers,
  LuCombine,
  LuMessageSquare,
  LuMail,
  LuSettings, LuUnplug
};
export const processedNavLinksWithIcons = (
  navLinks: NavItemWithoutPermission[]
) =>
  navLinks.map((link) => ({
    ...link,
    icon: iconMap[link.iconName as keyof typeof iconMap], // Convert string to component
    children: link.children
      ? link.children.map((child) => ({
        ...child,
        icon: child.iconName
          ? iconMap[child.iconName as keyof typeof iconMap]
          : undefined,
      }))
      : undefined,
  }));
const routePermissions = {
  "/dashboard/overview": DASH_NAV_PERMISSIONS.VIEW_DASHBOARD,
  "/dashboard/posts": DASH_NAV_PERMISSIONS.VIEW_POSTS,
  "/dashboard/posts/new": DASH_NAV_PERMISSIONS.CREATE_POST,
  "/dashboard/users": DASH_NAV_PERMISSIONS.VIEW_USERS,
  "/dashboard/media": DASH_NAV_PERMISSIONS.VIEW_MEDIA,
  "/dashboard/settings": DASH_NAV_PERMISSIONS.VIEW_SETTINGS,
  "/dashboard/comments": DASH_NAV_PERMISSIONS.VIEW_COMMENTS,
  "/dashboard/newletters": DASH_NAV_PERMISSIONS.VIEW_NEWSLETTERS,
  "/dashboard/taxonomies": DASH_NAV_PERMISSIONS.VIEW_DASHBOARD,
  "/dashboard/integrations": DASH_NAV_PERMISSIONS.VIEW_SETTINGS,
} as const;

// Navigation structure without embedded permissions

export const dashboardNavLinks2: NavItemWithoutPermission[] = [
  {
    iconName: "LuHouse",
    label: "Overview",
    href: "/dashboard/overview",
  },
  {
    iconName: "LuFileSpreadsheet",
    label: "Posts",
    href: "/dashboard/posts",
    children: [
      {
        label: "All Posts",
        href: "/dashboard/posts",
      },
      {
        label: "New Post",
        href: "/dashboard/posts/new",
      },
    ],
  },
  {
    label: "Taxonomies",
    href: "/dashboard/taxonomies",
    iconName: "LuCombine",
  },
  {
    iconName: "LuUsers",
    label: "Users",
    href: "/dashboard/users",
  },
  {
    iconName: "LuFileImage",
    label: "Media",
    href: "/dashboard/media",
  },
  {
    iconName: "LuMessageSquare",
    label: "Comments",
    href: "/dashboard/comments",
  },
  {
    iconName: "LuMail",
    label: "Newsletter",
    href: "/dashboard/newsletter",
  },
  {
    iconName: "LuSettings",
    label: "Settings",
    href: "/dashboard/settings",
  },
  {
    iconName: "LuUnplug",
    label: "Integrations",
    href: "/dashboard/integrations",
  },
];
export const getRoutePermission = (route: string) => {
  return routePermissions[route as keyof typeof routePermissions];
};
export const useDashboardNavigation = (userPermissions: TPermissions[]) => {
  const filterNavLinks = (
    links: NavItemWithoutPermission[]
  ): NavItemWithoutPermission[] => {
    return links.filter((link) => {
      const permission = getRoutePermission(link.href);

      // If no permission required or user has permission
      const hasPermission =
        !permission || userPermissions?.includes(permission);

      // Handle children recursively
      if (link.children) {
        link.children = filterNavLinks(link.children);
        console.log({
          child: link?.children,
        });
        // Show parent if any children are visible
        return link?.children?.length > 0 || hasPermission;
      }

      return hasPermission;
    });
  };

  return filterNavLinks(dashboardNavLinks2);
};
export const getDashboardNavigation = (userPermissions: TPermissions[]) => {
  const filterNavLinks = (
    links: NavItemWithoutPermission[]
  ): NavItemWithoutPermission[] => {
    return links.filter((link) => {
      const permission = getRoutePermission(link.href);

      // If no permission required or user has permission
      const hasPermission =
        !permission || userPermissions?.includes(permission);

      // Handle children recursively
      if (link.children) {
        link.children = filterNavLinks(link.children);

        // Show parent if any children are visible
        return link?.children?.length > 0 || hasPermission;
      }

      return hasPermission;
    });
  };

  return filterNavLinks(dashboardNavLinks2);
};
