"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkActionsToolbarProps {
  selectedCount: number;
  onDelete?: () => void;
  onExport?: () => void;
  onDeselectAll?: () => void;
  className?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  onDelete,
  onExport,
  onDeselectAll,
  className,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "from-primary/10 via-primary/5 to-background animate-in slide-in-from-top-2 border-primary/20 flex items-center justify-between gap-4 rounded-lg border bg-gradient-to-r p-4 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
          {selectedCount}
        </div>
        <span className="font-medium">
          {selectedCount} {selectedCount === 1 ? "row" : "rows"} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
        {onDeselectAll && (
          <Button variant="ghost" size="sm" onClick={onDeselectAll} className="gap-2">
            <X className="h-4 w-4" />
            Deselect all
          </Button>
        )}
      </div>
    </div>
  );
}

BulkActionsToolbar.displayName = "BulkActionsToolbar";
