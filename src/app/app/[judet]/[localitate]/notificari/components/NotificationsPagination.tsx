"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface NotificationsPaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  onPageChange: (page: number) => void;
}

/**
 * NotificationsPagination Component
 *
 * Classic pagination controls using shadcn/ui Pagination components.
 * Follows the same pattern as cereri/plati pages but uses shadcn/ui primitives.
 *
 * Features:
 * - Previous/Next buttons with disabled states at boundaries
 * - Numbered page buttons (max 5 visible at a time)
 * - Ellipsis for truncated pages
 * - Current page highlighted
 * - Info text: "Afișez X-Y din Z notificări"
 *
 * @param pagination - Pagination metadata from API
 * @param onPageChange - Callback when page changes
 */
export function NotificationsPagination({
  pagination,
  onPageChange,
}: NotificationsPaginationProps) {
  const { page, limit, total, total_pages } = pagination;

  // Don't render if only 1 page or no items
  if (total_pages <= 1) {
    return null;
  }

  // Calculate display range
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to display (max 5)
  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (total_pages <= maxVisible) {
      // Show all pages if total <= 5
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      // Complex logic: [1 ... 4 5 6 ... 10]
      if (page <= 3) {
        // Near start: [1 2 3 4 5 ... 10]
        for (let i = 1; i <= Math.min(5, total_pages); i++) {
          pages.push(i);
        }
        if (total_pages > 5) {
          pages.push("ellipsis");
          pages.push(total_pages);
        }
      } else if (page >= total_pages - 2) {
        // Near end: [1 ... 6 7 8 9 10]
        pages.push(1);
        pages.push("ellipsis");
        for (let i = total_pages - 4; i <= total_pages; i++) {
          pages.push(i);
        }
      } else {
        // Middle: [1 ... 4 5 6 ... 10]
        pages.push(1);
        pages.push("ellipsis");
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(total_pages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      {/* Info Text */}
      <p className="text-muted-foreground text-sm">
        Afișez {startItem}-{endItem} din {total} notificări
      </p>

      {/* Pagination Controls */}
      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && onPageChange(page - 1)}
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {/* Page Numbers */}
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === "ellipsis") {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={pageNum === page}
                  onClick={() => onPageChange(pageNum)}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              onClick={() => page < total_pages && onPageChange(page + 1)}
              aria-disabled={page === total_pages}
              className={page === total_pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
