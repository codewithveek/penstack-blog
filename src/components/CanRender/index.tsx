import { ReactNode } from "react";

interface CanRenderProps {
  enabled?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}
export function CanRender({
  enabled = true,
  children,
  fallback = null,
}: CanRenderProps): ReactNode {
  if (!enabled) {
    return fallback;
  }
  return children;
}
