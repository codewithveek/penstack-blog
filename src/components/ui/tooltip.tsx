"use client";

import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react";
import { forwardRef } from "react";
import type { ReactNode, RefObject } from "react";

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean;
  hasArrow?: boolean;
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement>;
  content?: ReactNode;
  label?: ReactNode;
  contentProps?: ChakraTooltip.ContentProps;
  disabled?: boolean;
  placement?: ChakraTooltip.ContentProps["position"];
  rounded?: string;
  [key: string]: any;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      hasArrow,
      children,
      disabled,
      portalled = true,
      content,
      label,
      contentProps,
      portalRef,
      placement,
      rounded,
      ...rest
    } = props;

    const tooltipContent = content || label;

    if (disabled || !tooltipContent) return <>{children}</>;

    return (
      <ChakraTooltip.Root
        {...rest}
        positioning={placement ? { placement } : undefined}
      >
        <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content
              ref={ref}
              {...contentProps}
              rounded={rounded}
            >
              {(showArrow || hasArrow) && (
                <ChakraTooltip.Arrow>
                  <ChakraTooltip.ArrowTip />
                </ChakraTooltip.Arrow>
              )}
              {tooltipContent}
            </ChakraTooltip.Content>
          </ChakraTooltip.Positioner>
        </Portal>
      </ChakraTooltip.Root>
    );
  }
);
