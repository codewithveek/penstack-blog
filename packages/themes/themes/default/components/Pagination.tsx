/**
 * packages/themes/themes/default/components/Pagination.tsx
 */

import * as React from "react";
import type { ThemePaginationContext } from "@cms/core/types/theme";

interface PaginationProps {
  pagination: ThemePaginationContext;
}

export function Pagination({ pagination }: PaginationProps) {
  if (pagination.pages <= 1) return null;

  return (
    <nav className="theme-pagination" aria-label="Pagination">
      {pagination.hasPrev && pagination.prevUrl && (
        <a href={pagination.prevUrl} className="theme-pagination__btn">
          ← Newer
        </a>
      )}
      <span className="theme-pagination__current">
        Page {pagination.page} of {pagination.pages}
      </span>
      {pagination.hasNext && pagination.nextUrl && (
        <a href={pagination.nextUrl} className="theme-pagination__btn">
          Older →
        </a>
      )}
    </nav>
  );
}
