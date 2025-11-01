import { formatDistanceToNowStrict, format } from "date-fns";
import { SnowflakeIdGenerator } from "@green-auth/snowflake-unique-id";
import { FeaturedPostType, PostSelect } from "../types";
import { type NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import isEmpty from "just-is-empty";
import slugify from "slugify";
import { decode, encode } from "html-entities";
import {
  defaultPermalinkPrefix,
  defaultPermalinkType,
  permalinkFormats,
  PermalinkType,
} from "./permalink";
import { cleanUrl, getSiteUrl, resolveUrl } from "./url";

type PercentageDifferenceResult = {
  formatted: string;
  raw: number;
};

/**
 * Calculate the percentage difference between two values.
 *
 * @param oldValue - The original/reference value
 * @param newValue - The new value to compare against
 * @param decimalPlaces - Number of decimal places to round to
 * @returns Object containing formatted string (with +/- sign and % symbol) and raw percentage
 * @throws Error if oldValue is 0 (division by zero) or if inputs are not numerical
 */
export function calculatePercentageDifference(
  oldValue: number,
  newValue: number,
  decimalPlaces: number = 1
): PercentageDifferenceResult {
  // Check for valid numerical inputs
  if (
    typeof oldValue !== "number" ||
    typeof newValue !== "number" ||
    isNaN(oldValue) ||
    isNaN(newValue)
  ) {
    throw new Error("Inputs must be valid numerical values");
  }

  // Handle division by zero
  if (oldValue === 0) {
    if (newValue === 0) {
      return {
        formatted: "0%",
        raw: 0,
      };
    }
    // For zero to non-zero, return the actual percentage increase
    // Since anything from zero is technically an infinite increase,
    // we just return the new value mutliplied by percentage
    return {
      formatted: `+${newValue * 100}%`,
      raw: newValue * 100,
    };
  }

  // Calculate percentage difference
  const diff: number = ((newValue - oldValue) / oldValue) * 100;

  // Round to specified decimal places
  const roundedDiff: number = Number(diff.toFixed(decimalPlaces));

  // Format the string with proper sign
  let formatted: string;
  if (diff > 0) {
    formatted = `+${roundedDiff}%`;
  } else if (diff < 0) {
    formatted = `${roundedDiff}%`;
  } else {
    formatted = "0%";
  }

  return {
    formatted,
    raw: roundedDiff,
  };
}
export function calculateReadingTime(content: string) {
  const wordsPerMinute = 238;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);

  return minutes;
}
export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "\n").replaceAll("\n", " ");
}
export function decodeAndSanitizeHtml(html: string) {
  return decode(html);
}
export function sanitizeAndEncodeHtml(html: string) {
  return encode(html);
}

export const snowflakeIdGenerator = new SnowflakeIdGenerator({
  nodeId: 10,
  sequenceBits: 20,
});
export const IdGenerator = {
  bigIntId: () => snowflakeIdGenerator.bigIntId(),
  uuid: () => uuidv4(),
};

export function formatDate(date: Date): string {
  if (!date) return "Invalid date";
  try {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) {
      return formatDistanceToNowStrict(date, {
        addSuffix: true,
        unit: "second",
      });
    } else if (diff < 3600000) {
      return formatDistanceToNowStrict(date, {
        addSuffix: true,
        unit: "minute",
      });
    } else if (diff < 86400000) {
      return formatDistanceToNowStrict(date, { addSuffix: true, unit: "hour" });
    } else {
      return format(date, "MMM d, yyyy");
    }
  } catch (error) {
    return "Invalid date";
  }
}

export function shortenText(text: string, len = 50) {
  return text?.length > len ? text?.substring(0, len) + "..." : text;
}

// Helper function to generate URLs based on format
export function generatePostUrl(
  post: PostSelect | FeaturedPostType,
  format: PermalinkType = defaultPermalinkType,
  prefix = "",
  useId = false
): string {
  const date = new Date((post?.published_at as Date) || post?.updated_at);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  let permalink = permalinkFormats[format]
    .replace("%prefix%", prefix)
    .replace("%year%", String(year))
    .replace("%month%", month)
    .replace("%day%", day)
    .replace("%category%", post?.category?.slug || "")
    .replace("%postname%", useId ? (post?.post_id ?? "") : (post?.slug ?? ""));

  return resolveUrl(getSiteUrl(), cleanUrl(permalink));
}

type QueryParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>;
type QueryParamObject = {
  [key: string]: QueryParamValue | QueryParamObject;
};

/**
 * Converts an object into a URL-encoded query string
 * @param params - Object to convert into query parameters
 * @param prefix - Optional prefix for nested objects
 * @returns URL-encoded query string
 *
 * @example
 * const params = {
 *   name: "John Doe",
 *   age: 30,
 *   filters: {
 *     active: true,
 *     roles: ["admin", "user"]
 *   }
 * };
 * objectToQueryParams(params);
 * // Returns: "name=John%20Doe&age=30&filters[active]=true&filters[roles][]=admin&filters[roles][]=user"
 */
export function objectToQueryParams<T extends object = QueryParamObject>(
  params: T,
  prefix: string = ""
): string {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const currentKey = prefix ? `${prefix}[${key}]` : key;

      if (Array.isArray(value)) {
        return value
          .map(
            (item) =>
              `${encodeURIComponent(currentKey)}[]=${encodeURIComponent(
                String(item)
              )}`
          )
          .join("&");
      }

      if (typeof value === "object") {
        return objectToQueryParams(value as QueryParamObject, currentKey);
      }

      return `${encodeURIComponent(currentKey)}=${encodeURIComponent(
        String(value)
      )}`;
    })
    .filter(Boolean)
    .join("&");
}

export function getServerSearchParams<T extends object>(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const params = Object.fromEntries(searchParams);
  return params as T;
}
interface LinkAttrs {
  href: string;
  target: string;
  rel: string;
  class: string | null;
}

interface Mark {
  type: string;
  attrs: LinkAttrs;
}

interface ContentItem {
  type: string;
  marks?: Mark[];
  text?: string;
}

interface ParagraphAttrs {
  textAlign: string;
}

interface ParagraphItem {
  type: string;
  attrs: ParagraphAttrs;
  content: ContentItem[];
}

interface ExtractResult {
  firstContent: ContentItem[] | null;
  text: string | null;
  linkMark: Mark | null;
}

export const extractContentAndLinkMark = (
  data: ParagraphItem[]
): ExtractResult => {
  try {
    // Check if data is an array and has at least one element
    if (!Array.isArray(data) || data.length === 0) {
      return {
        firstContent: null,
        text: null,
        linkMark: null,
      };
    }

    const firstItem = data[0];

    // Get first content array if it exists
    const firstContent = firstItem?.content || null;

    // Get text from first content item if it exists
    const text = firstContent?.[0]?.text || null;

    // Look for a link mark specifically
    const linkMark =
      firstContent?.[0]?.marks?.find((mark) => mark.type === "link") || null;

    return {
      firstContent,
      text,
      linkMark,
    };
  } catch (error) {
    console.error("Error extracting content and link mark:", error);
    return {
      firstContent: null,
      text: null,
      linkMark: null,
    };
  }
};
export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const nativeFormatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const isSecretKey = (key: string) => {
  const _key = key.toLowerCase();
  return (
    _key.includes("key") || _key.includes("secret") || _key.includes("token")
  );
};
export const generateSlug = (
  text: string,
  options: {
    replacement?: string;
    remove?: RegExp;
    lower?: boolean;
    strict?: boolean;
    locale?: string;
    trim?: boolean;
  } = {}
) => {
  if (isEmpty(text)) return "";
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    ...options,
  });
};
export function generatePostDescription(post: any, len = 150) {
  const description = shortenText(
    post?.summary || stripHtml(decodeAndSanitizeHtml(post?.content || "")),
    len
  );
  return description;
}
export async function isAllowedPrefix(path: string) {
  return path === defaultPermalinkPrefix;
}
