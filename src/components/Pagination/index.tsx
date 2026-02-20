import { Button, HStack, IconButton } from "@chakra-ui/react";
import React, { useMemo } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}) => {
  const getPageNumbers = useMemo(() => {
    const delta = 1; // Number of pages to show before and after current page
    const pages = [];

    // Always show first page
    pages.push(1);

    for (let i = currentPage - delta; i <= currentPage + delta; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    // Always show last page
    if (totalPages !== 1) {
      pages.push(totalPages);
    }

    // Add ellipsis where needed
    const withEllipsis = [];
    let prev = 0;

    for (const page of pages) {
      if (prev && page - prev > 1) {
        withEllipsis.push("...");
      }
      withEllipsis.push(page);
      prev = page;
    }

    return withEllipsis;
  }, [currentPage, totalPages]);

  return (
    <>
      {!loading && totalPages > 1 ? (
        <HStack gap={3} justify="center" align="center">
          <IconButton
            colorPalette="gray"
            size={"sm"}
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={loading || currentPage === 1}
            aria-label="Previous page"
          >
            <LuChevronLeft className="h-4 w-4" />
          </IconButton>

          {getPageNumbers.map((page, index) =>
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2">
                {page}
              </span>
            ) : (
              <Button
                size={"sm"}
                colorPalette="gray"
                aria-label={`Page ${page}`}
                key={page}
                variant={currentPage === page ? "solid" : "outline"}
                className="min-w-[40px]"
                onClick={() => onPageChange(page as number)}
                disabled={loading}
              >
                {page}
              </Button>
            )
          )}

          <IconButton
            size={"sm"}
            colorPalette="gray"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={loading || currentPage === totalPages}
            aria-label="Next page"
          >
            <LuChevronRight className="h-4 w-4" />
          </IconButton>
        </HStack>
      ) : null}
    </>
  );
};
export default Pagination;
