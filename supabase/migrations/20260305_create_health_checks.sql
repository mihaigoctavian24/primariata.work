-- Health Checks table for admin dashboard system health monitoring
-- Phase 14: Admin Dashboard

CREATE TABLE IF NOT EXISTS public.health_checks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  primarie_id uuid REFERENCES public.primarii(id),
  checked_at timestamptz DEFAULT now() NOT NULL,
  uptime_status boolean NOT NULL DEFAULT true,
  response_time_ms integer,
  db_active_connections integer,
  db_max_connections integer,
  storage_bytes_used bigint,
  active_sessions integer,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Index for efficient dashboard queries (latest health check per primarie)
CREATE INDEX idx_health_checks_primarie_checked
  ON public.health_checks(primarie_id, checked_at DESC);

-- Index for retention cleanup
CREATE INDEX idx_health_checks_checked_at
  ON public.health_checks(checked_at);

-- Enable RLS
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;

-- Admins can view their own primarie health checks
CREATE POLICY "Admins can view own primarie health checks"
  ON public.health_checks FOR SELECT
  USING (primarie_id IN (
    SELECT primarie_id FROM public.user_primarii
    WHERE user_id = auth.uid()
      AND rol IN ('admin', 'super_admin')
      AND status = 'approved'
  ));

-- Service role can insert (Edge Function uses service role)
CREATE POLICY "Service role can insert health checks"
  ON public.health_checks FOR INSERT
  WITH CHECK (true);

-- Postgres function to get DB connection stats (callable via RPC from Edge Functions)
CREATE OR REPLACE FUNCTION public.get_db_connection_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_count integer;
  max_conn integer;
BEGIN
  SELECT count(*) INTO active_count
  FROM pg_stat_activity
  WHERE state = 'active';

  SELECT setting::integer INTO max_conn
  FROM pg_settings
  WHERE name = 'max_connections';

  RETURN jsonb_build_object(
    'active_connections', active_count,
    'max_connections', max_conn
  );
END;
$$;

-- MANUAL SETUP REQUIRED for pg_cron scheduled health checks:
--
-- 1. Enable pg_cron and pg_net extensions (if not already enabled):
--    CREATE EXTENSION IF NOT EXISTS pg_cron;
--    CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- 2. Store project URL and service role key in Vault:
--    SELECT vault.create_secret('https://YOUR_PROJECT_REF.supabase.co', 'project_url');
--    SELECT vault.create_secret('YOUR_SERVICE_ROLE_KEY', 'service_role_key');
--
-- 3. Schedule health check every 5 minutes:
--    SELECT cron.schedule(
--      'health-check-every-5-min',
--      '*/5 * * * *',
--      $$
--        SELECT net.http_post(
--          url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
--                 || '/functions/v1/health-check',
--          headers := jsonb_build_object(
--            'Content-Type', 'application/json',
--            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
--          ),
--          body := '{}'::jsonb
--        ) AS request_id;
--      $$
--    );
