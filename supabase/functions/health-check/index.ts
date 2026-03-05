import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all active primarii (safeguard: max 100)
    const { data: primarii, error: primariiError } = await supabase
      .from("primarii")
      .select("id")
      .limit(100);

    if (primariiError) {
      throw new Error(`Failed to fetch primarii: ${primariiError.message}`);
    }

    for (const primarie of primarii || []) {
      try {
        // 1. Uptime check (self-ping to REST API)
        let uptimeOk = true;
        let responseTime = 0;

        try {
          const pingStart = Date.now();
          const pingResponse = await fetch(`${supabaseUrl}/rest/v1/primarii?select=id&limit=1`, {
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
            },
          });
          responseTime = Date.now() - pingStart;
          uptimeOk = pingResponse.ok;
        } catch {
          uptimeOk = false;
          responseTime = 5000; // timeout fallback
        }

        // 2. DB connection stats via RPC
        let dbActiveConnections: number | null = null;
        let dbMaxConnections: number | null = null;

        try {
          const { data: dbStats } = await supabase.rpc("get_db_connection_stats");
          if (dbStats) {
            dbActiveConnections = dbStats.active_connections ?? null;
            dbMaxConnections = dbStats.max_connections ?? null;
          }
        } catch {
          // pg_stat_activity may not be accessible through Supavisor - graceful fallback
        }

        // 3. Storage usage (total bytes from storage.objects metadata)
        let storageBytesUsed: number | null = null;

        try {
          const { data: storageData } = await supabase.rpc("get_storage_usage" as never).single();
          if (storageData) {
            storageBytesUsed = (storageData as { total_bytes: number }).total_bytes ?? null;
          }
        } catch {
          // Storage usage RPC may not exist yet - graceful fallback
          storageBytesUsed = null;
        }

        // 4. Active sessions (users with recent login for this primarie)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

        // Get user IDs for this primarie
        const { data: userLinks } = await supabase
          .from("user_primarii")
          .select("user_id")
          .eq("primarie_id", primarie.id)
          .eq("status", "approved");

        let activeSessions = 0;
        if (userLinks && userLinks.length > 0) {
          const userIds = userLinks.map((u: { user_id: string }) => u.user_id);
          const { count } = await supabase
            .from("utilizatori")
            .select("*", { count: "exact", head: true })
            .in("id", userIds)
            .gte("last_login_at", fifteenMinutesAgo);
          activeSessions = count ?? 0;
        }

        // Insert health check record
        await supabase.from("health_checks").insert({
          primarie_id: primarie.id,
          uptime_status: uptimeOk,
          response_time_ms: responseTime,
          db_active_connections: dbActiveConnections,
          db_max_connections: dbMaxConnections,
          storage_bytes_used: storageBytesUsed,
          active_sessions: activeSessions,
        });
      } catch (error) {
        // Log error for this primarie but continue with others
        const errorMessage = error instanceof Error ? error.message : String(error);
        await supabase.from("health_checks").insert({
          primarie_id: primarie.id,
          uptime_status: false,
          error_message: errorMessage,
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, checked: (primarii || []).length }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
