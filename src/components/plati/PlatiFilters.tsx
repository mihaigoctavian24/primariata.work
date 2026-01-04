"use client";

import { Calendar, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlataStatus, getPlataStatusLabel } from "@/lib/validations/plati";
import type { PlataStatusType } from "@/lib/validations/plati";
import { cn } from "@/lib/utils";

interface PlatiFiltersProps {
  status?: PlataStatusType;
  dateFrom?: string;
  dateTo?: string;
  onStatusChange: (status?: PlataStatusType) => void;
  onDateFromChange: (date?: string) => void;
  onDateToChange: (date?: string) => void;
  onReset: () => void;
  className?: string;
}

/**
 * PlatiFilters Component
 * Provides filter controls for the plati list
 *
 * Features:
 * - Status dropdown (all payment statuses)
 * - Date range filters (from/to)
 * - Reset filters button
 */
export function PlatiFilters({
  status,
  dateFrom,
  dateTo,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onReset,
  className,
}: PlatiFiltersProps) {
  const hasActiveFilters = status || dateFrom || dateTo;

  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center", className)}>
      {/* Status Filter */}
      <Select
        value={status || "all"}
        onValueChange={(value) =>
          onStatusChange(value === "all" ? undefined : (value as PlataStatusType))
        }
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Toate statusurile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toate statusurile</SelectItem>
          {Object.values(PlataStatus).map((statusValue) => (
            <SelectItem key={statusValue} value={statusValue}>
              {getPlataStatusLabel(statusValue as PlataStatusType)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date From Filter */}
      <div className="relative flex-1 md:max-w-[200px]">
        <Calendar className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <input
          type="date"
          value={dateFrom || ""}
          onChange={(e) => onDateFromChange(e.target.value || undefined)}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-9 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="De la data"
        />
      </div>

      {/* Date To Filter */}
      <div className="relative flex-1 md:max-w-[200px]">
        <Calendar className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <input
          type="date"
          value={dateTo || ""}
          onChange={(e) => onDateToChange(e.target.value || undefined)}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-9 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Până la data"
        />
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Resetează</span>
        </Button>
      )}
    </div>
  );
}
