"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { cn } from "@/lib/utils";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  className?: string;
}

const PRESETS = [
  {
    label: "Today",
    getValue: () => ({
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: "Yesterday",
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 1)),
      end: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: "Last 7 days",
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 6)),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: "Last 30 days",
    getValue: () => ({
      start: startOfDay(subDays(new Date(), 29)),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: "This month",
    getValue: () => ({
      start: startOfMonth(new Date()),
      end: endOfDay(new Date()),
    }),
  },
  {
    label: "Last month",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };
    },
  },
];

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (preset: (typeof PRESETS)[0]) => {
    onChange(preset.getValue());
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange({ start: null, end: null });
  };

  const formatDateRange = () => {
    if (!value.start && !value.end) return placeholder;
    if (value.start && !value.end) return format(value.start, "MMM d, yyyy");
    if (!value.start && value.end) return format(value.end, "MMM d, yyyy");
    return `${format(value.start!, "MMM d, yyyy")} - ${format(value.end!, "MMM d, yyyy")}`;
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value.start && !value.end && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets sidebar */}
            <div className="border-border bg-muted/30 border-r p-2">
              <div className="flex flex-col gap-1">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePresetClick(preset)}
                    className="justify-start font-normal"
                  >
                    {preset.label}
                  </Button>
                ))}
                {(value.start || value.end) && (
                  <>
                    <div className="border-border my-1 border-t" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive justify-start font-normal"
                    >
                      Clear
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Calendar */}
            <div className="p-3">
              <Calendar
                mode="range"
                selected={{
                  from: value.start || undefined,
                  to: value.end || undefined,
                }}
                onSelect={(range) => {
                  if (range) {
                    onChange({
                      start: range.from || null,
                      end: range.to || null,
                    });
                  }
                }}
                numberOfMonths={2}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

DateRangePicker.displayName = "DateRangePicker";
