import Script from "next/script";
import isEmpty from "just-is-empty";
import { useCallback } from "react";
import {
  ScriptComponentProps,
  ScriptStrategy,
} from "@/lib/third-party-scripts/types";

export function ScriptComponent({ script }: ScriptComponentProps): JSX.Element {
  const getStrategy = (): ScriptStrategy => {
    // Critical scripts that must load before interaction
    if (
      script.critical ||
      script.position === "head-end" ||
      script.position === "head-start"
    )
      return "beforeInteractive";

    // Analytics, tracking - can wait
    if (script.category === "analytics") return "lazyOnload";

    // Default
    return "afterInteractive";
  };

  const replacePlaceholdersInContent = useCallback(
    (content: string): string => {
      if (isEmpty(script.placeholders) || !script.placeholders) return content;
      return Object.entries(script.placeholders).reduce((acc, [key, value]) => {
        return acc.replace(new RegExp(`${key}`, "g"), value);
      }, content);
    },
    [script.placeholders]
  );
  const content = replacePlaceholdersInContent(script.content || "");

  const replacePlaceholdersInSrc = useCallback(
    (src: string): string => {
      if (isEmpty(script.placeholders) || !script.placeholders) return src;
      return Object.entries(script.placeholders).reduce((acc, [key, value]) => {
        return acc.replace(new RegExp(`${key}`, "g"), value);
      }, src);
    },
    [script.placeholders]
  );
  const src = replacePlaceholdersInSrc(script.src || "");
  return (
    <Script id={script.id} src={src} strategy={getStrategy()}>
      {`${content}`}
    </Script>
  );
}
