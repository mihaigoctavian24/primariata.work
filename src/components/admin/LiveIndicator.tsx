"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Settings, Clock, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { RefreshInterval } from "@/hooks/useRealTimeData";

export interface LiveIndicatorProps {
  isLive: boolean;
  isPulse: boolean;
  lastUpdated: Date | null;
  interval: RefreshInterval;
  isFetching: boolean;
  onToggleLive: () => void;
  onSetInterval: (interval: RefreshInterval) => void;
  onManualRefresh: () => void;
}

const INTERVAL_LABELS: Record<RefreshInterval, string> = {
  off: "Manual (off)",
  30000: "30 secunde",
  60000: "1 minut",
  300000: "5 minute",
};

const INTERVAL_OPTIONS: RefreshInterval[] = ["off", 30000, 60000, 300000];

/**
 * LiveIndicator Component
 *
 * Visual indicator for real-time data updates with settings control
 *
 * Features:
 * - Live badge with pulse animation
 * - Last updated timestamp
 * - Manual refresh button
 * - Settings dropdown for interval configuration
 * - Smooth fade animations
 */
export function LiveIndicator({
  isLive,
  isPulse,
  lastUpdated,
  interval,
  isFetching,
  onToggleLive,
  onSetInterval,
  onManualRefresh,
}: LiveIndicatorProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getLastUpdatedText = () => {
    if (!lastUpdated) return "Niciodată";

    try {
      return formatDistanceToNow(lastUpdated, {
        addSuffix: true,
        locale: ro,
      });
    } catch {
      return "Niciodată";
    }
  };

  return (
    <div className="border-border bg-card flex items-center gap-3 rounded-lg border p-3 shadow-sm">
      {/* Live Badge */}
      <div className="relative">
        <Badge
          variant={isLive ? "default" : "secondary"}
          className={cn(
            "gap-1.5 transition-all duration-300",
            isLive && "bg-green-600 hover:bg-green-700",
            isPulse && "animate-pulse"
          )}
        >
          <Circle className={cn("h-2 w-2 fill-current", isLive && "animate-pulse")} />
          {isLive ? "LIVE" : "OFFLINE"}
        </Badge>

        {/* Pulse ring animation */}
        {isPulse && isLive && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          </span>
        )}
      </div>

      {/* Last Updated */}
      <div className="flex flex-col gap-0.5">
        <span className="text-muted-foreground text-xs font-medium">Ultima actualizare</span>
        <span className="text-foreground text-xs font-semibold">{getLastUpdatedText()}</span>
      </div>

      {/* Divider */}
      <div className="bg-border h-8 w-px" />

      {/* Manual Refresh Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onManualRefresh}
        disabled={isFetching}
        className="gap-2"
      >
        <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
        Reîmprospătare
      </Button>

      {/* Settings Dropdown */}
      <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Setări
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Interval actualizare
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Live Toggle */}
          <DropdownMenuItem onClick={onToggleLive} className="cursor-pointer">
            <div className="flex w-full items-center justify-between">
              <span>{isLive ? "Dezactivează" : "Activează"} Live</span>
              <Badge variant={isLive ? "default" : "secondary"} className="ml-2">
                {isLive ? "ON" : "OFF"}
              </Badge>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Interval Options */}
          {INTERVAL_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => {
                onSetInterval(option);
                setIsSettingsOpen(false);
              }}
              disabled={!isLive && option !== "off"}
              className={cn("cursor-pointer", interval === option && "bg-accent")}
            >
              <div className="flex w-full items-center justify-between">
                <span>{INTERVAL_LABELS[option]}</span>
                {interval === option && <Circle className="text-primary h-2 w-2 fill-current" />}
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Current Status */}
          <div className="text-muted-foreground px-2 py-1.5 text-xs">
            {isLive ? (
              <>
                Actualizare automată la fiecare{" "}
                <span className="font-semibold">{INTERVAL_LABELS[interval]}</span>
              </>
            ) : (
              "Actualizare manuală activă"
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
