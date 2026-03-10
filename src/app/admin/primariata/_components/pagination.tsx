"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 flex items-center justify-between px-1"
    >
      {/* Info */}
      <div className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
        Afișare{" "}
        <span className="text-foreground" style={{ fontWeight: 600 }}>
          {startItem}–{endItem}
        </span>{" "}
        din{" "}
        <span className="text-foreground" style={{ fontWeight: 600 }}>
          {totalItems}
        </span>
      </div>

      {/* Page Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all disabled:cursor-not-allowed disabled:opacity-30"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border-subtle)",
            fontSize: "0.75rem",
            color: "var(--muted-foreground)",
          }}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {getPages().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="text-muted-foreground px-1.5"
              style={{ fontSize: "0.75rem" }}
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all ${
                page === currentPage
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              style={{ fontSize: "0.78rem", fontWeight: page === currentPage ? 600 : 400 }}
            >
              {page === currentPage && (
                <motion.div
                  layoutId="primariiPagination"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.08))",
                    border: "1px solid rgba(16,185,129,0.2)",
                    boxShadow: "0 0 12px rgba(16,185,129,0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{page}</span>
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 transition-all disabled:cursor-not-allowed disabled:opacity-30"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border-subtle)",
            fontSize: "0.75rem",
            color: "var(--muted-foreground)",
          }}
        >
          <span className="hidden sm:inline">Următor</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
