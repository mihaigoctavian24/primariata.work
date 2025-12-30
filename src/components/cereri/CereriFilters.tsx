"use client";

import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CerereStatus, getCerereStatusLabel } from "@/lib/validations/cereri";
import type { CerereStatusType } from "@/lib/validations/cereri";
import type { TipCerere } from "@/types/api";
import { cn } from "@/lib/utils";

interface CereriFiltersProps {
  status?: CerereStatusType;
  tipCerereId?: string;
  search?: string;
  tipuriCereri: TipCerere[];
  onStatusChange: (status?: CerereStatusType) => void;
  onTipCerereChange: (tipCerereId?: string) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
  className?: string;
}

/**
 * CereriFilters Component
 * Provides filter controls for the cereri list
 *
 * Features:
 * - Status dropdown (all statuses)
 * - Tip Cerere dropdown (from tipuri_cereri)
 * - Search by numar_inregistrare
 * - Reset filters button
 */
export function CereriFilters({
  status,
  tipCerereId,
  search,
  tipuriCereri,
  onStatusChange,
  onTipCerereChange,
  onSearchChange,
  onReset,
  className,
}: CereriFiltersProps) {
  const hasActiveFilters = status || tipCerereId || search;

  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center", className)}>
      {/* Search Input */}
      <div className="relative flex-1 md:max-w-xs">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Caută după număr cerere..."
          value={search || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
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

      {/* Tip Cerere Filter */}
      <Select
        value={tipCerereId || "all"}
        onValueChange={(value) => onTipCerereChange(value === "all" ? undefined : value)}
      >
        <SelectTrigger className="w-full md:w-[200px]">
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

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
          <X className="size-4" />
          Resetează
        </Button>
      )}
    </div>
  );
}
