"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, FileText, UserPlus, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { LiveActivityFeed } from "@/components/admin";
import type { ActivityItem } from "@/components/admin";
import { slideIn, defaultTransition } from "@/lib/motion";

interface LiveFeedSectionProps {
  primarieId: string;
}

function transformCerereInsert(record: Record<string, unknown>): ActivityItem {
  return {
    id: `cerere-new-${record.id ?? Date.now()}`,
    icon: FileText,
    title: "Cerere noua",
    description: `Nr. ${record.numar_inregistrare ?? "N/A"}`,
    timestamp: formatRelativeTime(new Date()),
    type: "info",
  };
}

function transformCerereUpdate(
  newRecord: Record<string, unknown>,
  oldRecord: Record<string, unknown>
): ActivityItem {
  const status = newRecord.status as string;
  const oldStatus = oldRecord.status as string;

  let type: ActivityItem["type"] = "info";
  let icon = RefreshCw;
  let title = "Cerere actualizata";

  if (status === "aprobata") {
    type = "success";
    icon = CheckCircle;
    title = "Cerere aprobata";
  } else if (status === "respinsa") {
    type = "error";
    icon = XCircle;
    title = "Cerere respinsa";
  } else if (status !== oldStatus) {
    title = `Status: ${status}`;
  }

  return {
    id: `cerere-update-${newRecord.id ?? Date.now()}-${Date.now()}`,
    icon,
    title,
    description: `Nr. ${newRecord.numar_inregistrare ?? "N/A"}`,
    timestamp: formatRelativeTime(new Date()),
    type,
  };
}

function transformRegistration(record: Record<string, unknown>): ActivityItem {
  return {
    id: `reg-${record.id ?? Date.now()}`,
    icon: UserPlus,
    title: "Inregistrare noua",
    description: `Rol: ${record.rol ?? "cetatean"}`,
    timestamp: formatRelativeTime(new Date()),
    type: "info",
  };
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "acum";
  if (diffMin < 60) return `acum ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `acum ${diffH}h`;
  return `acum ${Math.floor(diffH / 24)}z`;
}

const MAX_ITEMS = 20;

function LiveFeedSection({ primarieId }: LiveFeedSectionProps) {
  const [events, setEvents] = useState<ActivityItem[]>([]);

  const addEvent = useCallback((item: ActivityItem) => {
    setEvents((prev) => [item, ...prev].slice(0, MAX_ITEMS));
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`admin-activity-${primarieId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "cereri",
          filter: `primarie_id=eq.${primarieId}`,
        },
        (payload) => {
          addEvent(transformCerereInsert(payload.new as Record<string, unknown>));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cereri",
          filter: `primarie_id=eq.${primarieId}`,
        },
        (payload) => {
          addEvent(
            transformCerereUpdate(
              payload.new as Record<string, unknown>,
              payload.old as Record<string, unknown>
            )
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_primarii",
          filter: `primarie_id=eq.${primarieId}`,
        },
        (payload) => {
          addEvent(transformRegistration(payload.new as Record<string, unknown>));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [primarieId, addEvent]);

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={defaultTransition}
      className="h-full rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-emerald-400" />
        <h3 className="text-foreground text-[0.95rem] font-semibold">Activitate Live</h3>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[0.72rem] text-emerald-400">Live</span>
        </div>
      </div>

      {events.length > 0 ? (
        <LiveActivityFeed items={events} maxVisible={6} />
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Activity className="text-muted-foreground/50 h-5 w-5" />
          <p className="text-muted-foreground text-xs">Asteapta evenimente...</p>
        </div>
      )}
    </motion.div>
  );
}

export { LiveFeedSection };
