"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, Archive } from "lucide-react";

interface NotificationsTabsProps {
  activeTab: "toate" | "urgente" | "arhiva";
  onTabChange: (tab: "toate" | "urgente" | "arhiva") => void;
  counts: {
    toate: number;
    urgente: number;
    arhiva: number;
  };
}

export function NotificationsTabs({ activeTab, onTabChange, counts }: NotificationsTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as typeof activeTab)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger
          value="toate"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
        >
          <Bell className="h-4 w-4" />
          Toate
          {counts.toate > 0 && (
            <Badge variant="secondary" className="h-5 min-w-5 rounded-full px-1.5 text-xs">
              {counts.toate}
            </Badge>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="urgente"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
        >
          <AlertCircle className="h-4 w-4" />
          Urgente
          {counts.urgente > 0 && (
            <Badge variant="destructive" className="h-5 min-w-5 rounded-full px-1.5 text-xs">
              {counts.urgente}
            </Badge>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="arhiva"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
        >
          <Archive className="h-4 w-4" />
          Arhivă
          {counts.arhiva > 0 && (
            <Badge variant="outline" className="h-5 min-w-5 rounded-full px-1.5 text-xs">
              {counts.arhiva}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
