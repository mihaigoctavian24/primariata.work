"use client";

import { Search, X, Calendar, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CerereStatus, getCerereStatusLabel } from "@/lib/validations/cereri";
import type { CerereStatusType } from "@/lib/validations/cereri";
import type { TipCerere } from "@/types/api";
import { cn } from "@/lib/utils";

interface CereriFiltersProps {
  status?: CerereStatusType;
  tipCerereId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  tipuriCereri: TipCerere[];
  onStatusChange: (status?: CerereStatusType) => void;
  onTipCerereChange: (tipCerereId?: string) => void;
  onSearchChange: (search: string) => void;
  onDateRangeChange: (from?: Date, to?: Date) => void;
  onSortChange: (sortBy: string) => void;
  onReset: () => void;
  className?: string;
}

/**
 * CereriFilters Component
 * Provides advanced filter controls for the cereri list
 *
 * Features (Issue #88):
 * - Search by numar_inregistrare or titlu (debounced)
 * - Status dropdown (all statuses)
 * - Tip Cerere dropdown (from tipuri_cereri)
 * - Date range filter with presets
 * - Advanced sort dropdown
 * - Active filter count badge
 * - Reset filters button
 */
export function CereriFilters({
  status,
  tipCerereId,
  search,
  dateFrom,
  dateTo,
  sortBy = "created_at_desc",
  tipuriCereri,
  onStatusChange,
  onTipCerereChange,
  onSearchChange,
  onDateRangeChange,
  onSortChange,
  onReset,
  className,
}: CereriFiltersProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [datePreset, setDatePreset] = useState<string>("all");

  // Calculate active filter count
  const activeFilterCount = [
    search,
    status,
    tipCerereId,
    dateFrom,
    dateTo,
    sortBy !== "created_at_desc",
  ].filter(Boolean).length;

  // Date range presets
  const applyDatePreset = (preset: string) => {
    const today = new Date();
    setDatePreset(preset);

    switch (preset) {
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        onDateRangeChange(weekAgo, today);
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        onDateRangeChange(monthAgo, today);
        break;
      case "3months":
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        onDateRangeChange(threeMonthsAgo, today);
        break;
      case "all":
        onDateRangeChange(undefined, undefined);
        break;
    }
  };

  // Format date range display
  const getDateRangeDisplay = () => {
    if (!dateFrom && !dateTo) return "Toate timpurile";
    if (dateFrom && dateTo) {
      return `${format(dateFrom, "dd.MM.yyyy", { locale: ro })} - ${format(dateTo, "dd.MM.yyyy", { locale: ro })}`;
    }
    if (dateFrom) return `De la ${format(dateFrom, "dd.MM.yyyy", { locale: ro })}`;
    if (dateTo) return `Până la ${format(dateTo, "dd.MM.yyyy", { locale: ro })}`;
    return "Toate timpurile";
  };

  // Sort options
  const sortOptions = [
    { value: "created_at_desc", label: "Mai recente" },
    { value: "created_at_asc", label: "Mai vechi" },
    { value: "status_asc", label: "Status (A-Z)" },
    { value: "numar_inregistrare_asc", label: "Număr înregistrare" },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Filter Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Caută după număr sau titlu..."
            value={search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-9 pl-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2 p-0 hover:bg-transparent"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <Select
          value={status || "all"}
          onValueChange={(value) =>
            onStatusChange(value === "all" ? undefined : (value as CerereStatusType))
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Toate statusurile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate statusurile</SelectItem>
            {Object.values(CerereStatus).map((statusValue) => (
              <SelectItem key={statusValue} value={statusValue}>
                {getCerereStatusLabel(statusValue as CerereStatusType)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start gap-2 text-left font-normal md:w-[280px]",
                (dateFrom || dateTo) && "border-primary text-primary"
              )}
            >
              <Calendar className="size-4" />
              <span className="truncate">Perioada: {getDateRangeDisplay()}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              {/* Presets Sidebar */}
              <div className="border-border/40 flex flex-col gap-1 border-r p-3">
                <Button
                  variant={datePreset === "all" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => applyDatePreset("all")}
                  className="justify-start"
                >
                  Toate timpurile
                </Button>
                <Button
                  variant={datePreset === "week" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => applyDatePreset("week")}
                  className="justify-start"
                >
                  Ultima săptămână
                </Button>
                <Button
                  variant={datePreset === "month" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => applyDatePreset("month")}
                  className="justify-start"
                >
                  Ultima lună
                </Button>
                <Button
                  variant={datePreset === "3months" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => applyDatePreset("3months")}
                  className="justify-start"
                >
                  Ultimele 3 luni
                </Button>
                <Button
                  variant={datePreset === "custom" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setDatePreset("custom")}
                  className="justify-start"
                >
                  Personalizat
                </Button>
              </div>

              {/* Date Picker (shown when custom selected) */}
              {datePreset === "custom" && (
                <div className="p-3">
                  <DayPicker
                    mode="range"
                    selected={{ from: dateFrom, to: dateTo }}
                    onSelect={(range) => {
                      onDateRangeChange(range?.from, range?.to);
                    }}
                    locale={ro}
                    disabled={{ after: new Date() }}
                    numberOfMonths={2}
                  />
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <ArrowUpDown className="mr-2 size-4" />
            <SelectValue placeholder="Sortare" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Secondary Filter Bar - Tip Cerere and Reset */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Tip Cerere Filter */}
        <Select
          value={tipCerereId || "all"}
          onValueChange={(value) => onTipCerereChange(value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-full sm:w-[250px]">
            <SelectValue placeholder="Toate tipurile" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate tipurile</SelectItem>
            {tipuriCereri.map((tip) => (
              <SelectItem key={tip.id} value={tip.id}>
                {tip.nume}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Active Filters Badge and Reset Button */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium">
              {activeFilterCount} {activeFilterCount === 1 ? "filtru activ" : "filtre active"}
            </span>
            <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
              <X className="size-4" />
              Resetează filtre
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
