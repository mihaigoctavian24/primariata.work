"use client";

import { useState, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, ChevronsUpDown, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLocalitatiSearch } from "@/hooks/useLocalitatiSearch";
import type { Localitate } from "@/types/api";

interface LocalitateComboboxProps {
  judetId: number | null;
  value?: number | null;
  onSelect: (localitateId: number) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function LocalitateCombobox({
  judetId,
  value,
  onSelect,
  disabled = false,
  placeholder = "Caută și selectează localitatea",
  className,
}: LocalitateComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocalitate, setSelectedLocalitate] = useState<Localitate | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);

  const { localitati, filteredLocalitati, loading, error, retry } = useLocalitatiSearch({
    judetId,
    searchQuery,
  });

  // Virtual scrolling setup - use filtered results
  const rowVirtualizer = useVirtualizer({
    count: filteredLocalitati.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  // Update selected localitate when value changes
  useEffect(() => {
    if (value && localitati.length > 0) {
      const found = localitati.find((loc) => loc.id === value);
      if (found) {
        setSelectedLocalitate(found);
      }
    } else if (!value) {
      setSelectedLocalitate(null);
    }
  }, [value, localitati]);

  // Clear search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handleSelect = (localitate: Localitate) => {
    setSelectedLocalitate(localitate);
    onSelect(localitate.id);
    setOpen(false);
  };

  const getTipBadgeVariant = (tip: string | null) => {
    if (!tip) return "secondary";

    const tipLower = tip.toLowerCase();
    if (tipLower.includes("municipiu")) return "default";
    if (tipLower.includes("oraș")) return "secondary";
    return "outline";
  };

  // Show empty state if no județ selected
  if (!judetId) {
    return (
      <Popover open={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={true}
            className={cn("text-muted-foreground w-full justify-between", className)}
            aria-label="Selectează județul mai întâi"
          >
            Selectează județul mai întâi
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={placeholder}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !selectedLocalitate && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selectedLocalitate ? (
              <span className="flex items-center gap-2">
                {selectedLocalitate.nume}
                {selectedLocalitate.tip && (
                  <Badge variant={getTipBadgeVariant(selectedLocalitate.tip)} className="text-xs">
                    {selectedLocalitate.tip}
                  </Badge>
                )}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex flex-col">
          <div className="flex items-center border-b px-3">
            <input
              type="text"
              placeholder="Caută localitatea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Caută localitatea"
            />
          </div>
          <div className="max-h-[300px] overflow-hidden">
            {/* Loading State */}
            {loading && (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Se încarcă localitățile...
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="space-y-2 p-4">
                <div className="text-destructive flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
                <Button variant="outline" size="sm" onClick={retry} className="w-full">
                  Reîncearcă
                </Button>
              </div>
            )}

            {/* Empty State - No Results */}
            {!loading && !error && filteredLocalitati.length === 0 && searchQuery && (
              <div className="text-muted-foreground py-6 text-center text-sm">
                Nu există localități pentru &quot;{searchQuery}&quot;
              </div>
            )}

            {/* Empty State - No Search */}
            {!loading && !error && filteredLocalitati.length === 0 && !searchQuery && (
              <div className="text-muted-foreground py-6 text-center text-sm">
                Nu au fost găsite localități
              </div>
            )}

            {/* Virtual Scrolling List */}
            {!loading && !error && filteredLocalitati.length > 0 && (
              <div
                ref={parentRef}
                className="max-h-[300px] overflow-auto"
                role="listbox"
                aria-label="Listă localități"
              >
                <div
                  style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const localitate = filteredLocalitati[virtualRow.index];
                    if (!localitate) return null;
                    const isSelected = selectedLocalitate?.id === localitate.id;

                    return (
                      <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div
                          role="option"
                          aria-selected={isSelected}
                          className={cn(
                            "hover:bg-accent hover:text-accent-foreground relative flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-2 text-sm transition-colors outline-none select-none",
                            isSelected && "bg-accent",
                            "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          )}
                          onClick={() => handleSelect(localitate)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelect(localitate);
                            }
                          }}
                          tabIndex={0}
                        >
                          <div className="flex flex-1 items-center gap-2">
                            <span className="truncate">{localitate.nume}</span>
                            {localitate.tip && (
                              <Badge
                                variant={getTipBadgeVariant(localitate.tip)}
                                className="text-xs"
                              >
                                {localitate.tip}
                              </Badge>
                            )}
                          </div>
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results Count for Screen Readers */}
            {!loading && filteredLocalitati.length > 0 && (
              <div className="sr-only" role="status" aria-live="polite">
                {filteredLocalitati.length} localități găsite
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
