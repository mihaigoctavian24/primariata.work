"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TableSkeleton } from "./TableSkeleton";

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  canHide?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;

  // Sorting
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;

  // Selection
  enableSelection?: boolean;
  selectedRows?: Set<string | number>;
  onRowSelect?: (id: string | number) => void;
  onSelectAll?: () => void;

  // Pagination
  currentPage?: number;
  totalPages?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  totalRows?: number;

  // Column visibility
  hiddenColumns?: Set<string>;
  onToggleColumn?: (key: string) => void;

  // View mode
  viewMode?: "compact" | "comfortable";
  onViewModeChange?: (mode: "compact" | "comfortable") => void;

  // Expanded rows
  expandedRows?: Set<string | number>;
  onToggleExpand?: (id: string | number) => void;
  renderExpandedRow?: (item: T) => ReactNode;

  className?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  emptyMessage = "No data available",
  onRowClick,
  sortBy,
  sortDirection,
  onSort,
  enableSelection = false,
  selectedRows = new Set(),
  onRowSelect,
  onSelectAll,
  currentPage = 1,
  totalPages = 1,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  totalRows = 0,
  hiddenColumns = new Set(),
  onToggleColumn,
  viewMode = "comfortable",
  onViewModeChange,
  expandedRows = new Set(),
  onToggleExpand,
  renderExpandedRow,
  className,
}: DataTableProps<T>) {
  const visibleColumns = columns.filter((col) => !hiddenColumns.has(col.key));
  const allRowsSelected = data.length > 0 && data.every((row) => selectedRows.has(row.id));

  const getSortIcon = (key: string) => {
    if (sortBy !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  if (isLoading) {
    return <TableSkeleton rows={rowsPerPage} columns={visibleColumns.length} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Column visibility */}
          {onToggleColumn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Columns className="h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {columns
                  .filter((col) => col.canHide !== false)
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={!hiddenColumns.has(column.key)}
                      onCheckedChange={() => onToggleColumn(column.key)}
                    >
                      {column.header}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* View mode toggle */}
          {onViewModeChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewModeChange(viewMode === "compact" ? "comfortable" : "compact")}
              className="gap-2"
            >
              {viewMode === "compact" ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
              {viewMode === "compact" ? "Comfortable" : "Compact"}
            </Button>
          )}
        </div>

        {/* Rows per page */}
        {onRowsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Rows per page:</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => onRowsPerPageChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 backdrop-blur-sm">
              <TableRow>
                {enableSelection && onRowSelect && onSelectAll && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allRowsSelected}
                      onCheckedChange={onSelectAll}
                      aria-label="Select all rows"
                    />
                  </TableHead>
                )}
                {visibleColumns.map((column) => (
                  <TableHead
                    key={column.key}
                    style={{ width: column.width }}
                    className={cn(
                      viewMode === "compact" ? "py-2" : "py-3",
                      column.sortable && "cursor-pointer select-none"
                    )}
                    onClick={() => column.sortable && onSort?.(column.key)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
                {renderExpandedRow && <TableHead className="w-12" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={
                      visibleColumns.length +
                      (enableSelection ? 1 : 0) +
                      (renderExpandedRow ? 1 : 0)
                    }
                    className="text-muted-foreground h-32 text-center"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {data.map((item) => (
                    <>
                      <TableRow
                        key={item.id}
                        className={cn(
                          "hover:bg-muted/50 transition-colors",
                          onRowClick && "cursor-pointer",
                          selectedRows.has(item.id) && "bg-muted/30"
                        )}
                        onClick={() => onRowClick?.(item)}
                      >
                        {enableSelection && onRowSelect && (
                          <TableCell
                            onClick={(e) => {
                              e.stopPropagation();
                              onRowSelect(item.id);
                            }}
                          >
                            <Checkbox
                              checked={selectedRows.has(item.id)}
                              aria-label={`Select row ${item.id}`}
                            />
                          </TableCell>
                        )}
                        {visibleColumns.map((column) => (
                          <TableCell
                            key={column.key}
                            className={viewMode === "compact" ? "py-2" : "py-4"}
                          >
                            {column.accessor(item)}
                          </TableCell>
                        ))}
                        {renderExpandedRow && onToggleExpand && (
                          <TableCell
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleExpand(item.id);
                            }}
                            className="cursor-pointer"
                          >
                            {expandedRows.has(item.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                      {renderExpandedRow && expandedRows.has(item.id) && (
                        <TableRow>
                          <TableCell
                            colSpan={
                              visibleColumns.length +
                              (enableSelection ? 1 : 0) +
                              (renderExpandedRow !== undefined ? 1 : 0)
                            }
                            className="bg-muted/20"
                          >
                            {renderExpandedRow(item)}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

DataTable.displayName = "DataTable";
