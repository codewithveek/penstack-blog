import React, { useMemo } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";
import { Button, HStack, IconButton } from "@chakra-ui/react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
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
      {!isLoading && totalPages > 1 ? (
        <HStack gap={3} justify="center" align="center">
          <IconButton
            colorScheme="gray"
            size={"sm"}
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            isDisabled={isLoading || currentPage === 1}
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
                colorScheme="gray"
                aria-label={`Page ${page}`}
                key={page}
                variant={currentPage === page ? "solid" : "outline"}
                className="min-w-[40px]"
                onClick={() => onPageChange(page as number)}
                isDisabled={isLoading}
              >
                {page}
              </Button>
            )
          )}

          <IconButton
            size={"sm"}
            colorScheme="gray"
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            isDisabled={isLoading || currentPage === totalPages}
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
