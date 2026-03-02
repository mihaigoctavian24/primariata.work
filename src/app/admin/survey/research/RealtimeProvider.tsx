"use client";

import { logger } from "@/lib/logger";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeProviderProps {
  children: React.ReactNode;
  onDataUpdate?: () => void;
}

/**
 * RealtimeProvider - Manages real-time updates for survey responses
 *
 * Features:
 * - Subscribes to survey_respondents and survey_responses tables
 * - Debounces updates to prevent excessive API calls
 * - Auto-triggers analysis after 5 minutes of inactivity
 */
export function RealtimeProvider({ children, onDataUpdate }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [newResponsesCount, setNewResponsesCount] = useState(0);

  // Refs for channels and timers
  const respondentsChannel = useRef<RealtimeChannel | null>(null);
  const responsesChannel = useRef<RealtimeChannel | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const analysisTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle new data arrival - debounced refresh
   */
  const handleNewData = useCallback(
    (type: "respondent" | "response") => {
      logger.debug(`[Realtime] New ${type} detected`);

      // Increment counter
      setNewResponsesCount((prev) => prev + 1);

      // Clear existing timers
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (analysisTimer.current) {
        clearTimeout(analysisTimer.current);
      }

      // Debounce: wait 2 seconds before refreshing data
      debounceTimer.current = setTimeout(() => {
        logger.debug("[Realtime] Triggering data refresh");
        logger.debug(
          `[Realtime] 🔄 Date noi primite: ${newResponsesCount + 1} răspuns${newResponsesCount > 0 ? "uri" : ""} nou${newResponsesCount > 0 ? "e" : ""}`
        );

        if (onDataUpdate) {
          onDataUpdate();
        }

        // Reset counter
        setNewResponsesCount(0);

        // Schedule AI analysis after 5 minutes of inactivity
        analysisTimer.current = setTimeout(
          () => {
            logger.debug("[Realtime] Triggering auto-analysis after 5 min inactivity");

            // Trigger AI analysis
            fetch("/api/survey/research/analyze", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({}),
            })
              .then((res) => {
                if (res.ok) {
                  logger.debug(
                    "[Realtime] ✅ Analiză completă - datele au fost procesate automat cu AI"
                  );
                  // Refresh data again to show new analysis
                  if (onDataUpdate) {
                    onDataUpdate();
                  }
                }
              })
              .catch((err) => {
                logger.error("[Realtime] Auto-analysis failed:", err);
              });
          },
          5 * 60 * 1000
        ); // 5 minutes
      }, 2000); // 2 seconds debounce
    },
    [onDataUpdate, newResponsesCount]
  );

  /**
   * Setup Supabase Realtime subscriptions
   */
  useEffect(() => {
    const supabase = createClient();

    logger.debug("[Realtime] Setting up subscriptions...");

    // Subscribe to survey_respondents table
    respondentsChannel.current = supabase
      .channel("survey_respondents_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "survey_respondents",
        },
        (payload) => {
          logger.debug("[Realtime] New respondent:", payload);
          handleNewData("respondent");
        }
      )
      .subscribe((status) => {
        logger.debug("[Realtime] Respondents channel status:", status);
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        }
      });

    // Subscribe to survey_responses table
    responsesChannel.current = supabase
      .channel("survey_responses_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "survey_responses",
        },
        (payload) => {
          logger.debug("[Realtime] New response:", payload);
          handleNewData("response");
        }
      )
      .subscribe((status) => {
        logger.debug("[Realtime] Responses channel status:", status);
      });

    // Cleanup on unmount
    return () => {
      logger.debug("[Realtime] Cleaning up subscriptions...");

      if (respondentsChannel.current) {
        supabase.removeChannel(respondentsChannel.current);
      }
      if (responsesChannel.current) {
        supabase.removeChannel(responsesChannel.current);
      }

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (analysisTimer.current) {
        clearTimeout(analysisTimer.current);
      }

      setIsConnected(false);
    };
  }, [handleNewData]);

  return (
    <>
      {children}
      {/* Connection status indicator (optional, can be shown in UI) */}
      {process.env.NODE_ENV === "development" && isConnected && (
        <div className="fixed right-4 bottom-4 z-50 rounded-full bg-green-500 px-3 py-1 text-xs text-white shadow-lg">
          🟢 Real-time connected
        </div>
      )}
    </>
  );
}
