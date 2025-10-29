"use client";

import { useState, useCallback, useMemo } from "react";

/**
 * Hook for managing table state (sorting, pagination, selection)
 * Skeleton implementation - to be completed in Phase 2
 */

export interface UseTableStateOptions<T> {
  data: T[];
  pageSize?: number;
  defaultSortBy?: string;
  defaultSortDirection?: "asc" | "desc";
  enableSelection?: boolean;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export type ViewMode = "compact" | "comfortable";

export function useTableState<T extends { id: string | number }>(options: UseTableStateOptions<T>) {
  const { data, pageSize = 10, defaultSortBy, defaultSortDirection = "asc" } = options;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(
    defaultSortBy ? { key: defaultSortBy, direction: defaultSortDirection } : null
  );

  // Selection state
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Column visibility state
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("comfortable");

  // Expanded rows state (for accordion)
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === bValue) return 0;

      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [data, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, rowsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Handle sort
  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: "asc" };
      }

      if (prev.direction === "asc") {
        return { key, direction: "desc" };
      }

      return null; // Remove sort
    });
  }, []);

  // Handle page change
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Change rows per page
  const changeRowsPerPage = useCallback((newPageSize: number) => {
    setRowsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Handle selection
  const toggleRowSelection = useCallback((id: string | number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleAllRows = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((row) => row.id)));
    }
  }, [paginatedData, selectedRows.size]);

  const selectAllRows = useCallback(() => {
    setSelectedRows(new Set(data.map((row) => row.id)));
  }, [data]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  // Check if row is selected
  const isRowSelected = useCallback(
    (id: string | number) => {
      return selectedRows.has(id);
    },
    [selectedRows]
  );

  // Check if all rows are selected
  const areAllRowsSelected = paginatedData.length > 0 && selectedRows.size === paginatedData.length;

  // Get selected rows data
  const selectedRowsData = useMemo(() => {
    return data.filter((row) => selectedRows.has(row.id));
  }, [data, selectedRows]);

  // Column visibility
  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setHiddenColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  }, []);

  const isColumnVisible = useCallback(
    (columnKey: string) => {
      return !hiddenColumns.has(columnKey);
    },
    [hiddenColumns]
  );

  const showAllColumns = useCallback(() => {
    setHiddenColumns(new Set());
  }, []);

  // Expanded rows
  const toggleRowExpansion = useCallback((id: string | number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const isRowExpanded = useCallback(
    (id: string | number) => {
      return expandedRows.has(id);
    },
    [expandedRows]
  );

  return {
    // Data
    paginatedData,
    sortedData,
    totalPages,
    totalRows: data.length,

    // Pagination
    currentPage,
    rowsPerPage,
    goToPage,
    nextPage,
    previousPage,
    changeRowsPerPage,
    canGoNext: currentPage < totalPages,
    canGoPrevious: currentPage > 1,

    // Sorting
    sortConfig,
    handleSort,

    // Selection
    selectedRows,
    selectedRowsData,
    toggleRowSelection,
    toggleAllRows,
    selectAllRows,
    clearSelection,
    isRowSelected,
    areAllRowsSelected,
    hasSelection: selectedRows.size > 0,

    // Column visibility
    hiddenColumns,
    toggleColumnVisibility,
    isColumnVisible,
    showAllColumns,

    // View mode
    viewMode,
    setViewMode,

    // Expanded rows
    expandedRows,
    toggleRowExpansion,
    isRowExpanded,
  };
}
