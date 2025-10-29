"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchBar } from "./SearchBar";
import { DateRangePicker, DateRange } from "./DateRangePicker";

export interface FilterOption {
  id: string;
  label: string;
  type: "select" | "multiselect" | "daterange" | "search";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface FilterPanelProps {
  filters: FilterOption[];
  values: Record<string, unknown>;
  onChange: (filterId: string, value: unknown) => void;
  onReset?: () => void;
  activeCount?: number;
  className?: string;
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  activeCount = 0,
  className,
}: FilterPanelProps) {
  const renderFilter = (filter: FilterOption) => {
    switch (filter.type) {
      case "select":
        return (
          <Select
            value={(values[filter.id] as string) || ""}
            onValueChange={(value) => onChange(filter.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        const selectedValues = (values[filter.id] as string[]) || [];
        return (
          <div className="space-y-2">
            <Select
              value=""
              onValueChange={(value) => {
                const current = (values[filter.id] as string[]) || [];
                if (!current.includes(value)) {
                  onChange(filter.id, [...current, value]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={filter.placeholder || "Select..."} />
              </SelectTrigger>
              <SelectContent>
                {filter.options
                  ?.filter((opt) => !selectedValues.includes(opt.value))
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedValues.map((value) => {
                  const option = filter.options?.find((o) => o.value === value);
                  return (
                    <Badge key={value} variant="secondary" className="gap-1 pr-1">
                      {option?.label || value}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => {
                          const current = values[filter.id] as string[];
                          onChange(
                            filter.id,
                            current.filter((v) => v !== value)
                          );
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "search":
        return (
          <SearchBar
            value={(values[filter.id] as string) || ""}
            onChange={(value) => onChange(filter.id, value)}
            placeholder={filter.placeholder || "Search..."}
            showShortcut={false}
          />
        );

      case "daterange":
        return (
          <DateRangePicker
            value={(values[filter.id] as DateRange) || { start: null, end: null }}
            onChange={(range) => onChange(filter.id, range)}
            placeholder={filter.placeholder || "Select date range"}
          />
        );

      default:
        return <div>Unknown filter type</div>;
    }
  };

  return (
    <div
      className={cn(
        "from-card to-muted/20 border-border rounded-lg border bg-gradient-to-br p-6 shadow-lg",
        className
      )}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
          {activeCount > 0 && (
            <Badge variant="default" className="ml-2">
              {activeCount}
            </Badge>
          )}
        </div>
        {onReset && activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Clear all
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.id} className="space-y-2">
            <Label htmlFor={filter.id} className="text-sm font-medium">
              {filter.label}
            </Label>
            {renderFilter(filter)}
          </div>
        ))}
      </div>
    </div>
  );
}

FilterPanel.displayName = "FilterPanel";
